/**
 * Created with JetBrains WebStorm.
 * User: blakec
 * Date: 5/30/13
 * Time: 2:24 PM
 * To change this template use File | Settings | File Templates.
 */
var TheoraFrameDecoder = function(raw)
{
    this.raw =raw;
};


/**
 * 7.1
 * The frame header selects which type of frame is being decoded, intra or inter,
 * and contains the list of qi values that will be used in this frame. The rst qi
 * value will be used for all DC coecients in all blocks. This is done to ensure
 * that DC prediction, which is done in the quantized domain, works as expected.
 * The AC coecients, however, can be dequantized using any qi value on the list,
 * selected on a block-by-block basis.
 */

TheoraFrameDecoder.prototype.decodeFrameHeader = function()
{
    // 1
    var isPacket = this.raw.readBits(1);

    if(isPacket == 1)
    {
        throw new Error("TheoraFrameDecoder:decodeFrameHeader: invalid packet");
    }

    // 2

    // This is the type of frame being decoded, as given in Table 7.3.
    // If this is the first frame being decoded this MUST be zero.

    var ftype = this.raw.readBits(1);

    // 3

    // An NQIS-element array of qi values.
    var qis = [];

    qis[0] = this.raw.readBits(6);

    // 4

    var nqis;

    var moreqis = this.raw.readBits(1);
// 5
    if(moreqis == 0)
    {

        nqis=1;
    }
    // 6
    else
    {
        // 6a
        qis[1]=this.raw.readBits(6);

        // 6b

        moreqis = this.raw.readBits(1);
        // 6c
        if(moreqis == 0)
        {
            nqis = 2;
        }
        // 6d
        else
        {
            // 6di
            qis[2]=this.raw.readBits(6);
            // 6dii
            nqis = 3;
        }
    }

    // 7
    if (ftype == 0)
    {
        this.raw.readBits(3);
    }
    else
    {
        throw new Error("TheoraFrameDecoder:decodeFrameHeader: (7.1.7) This frame is not decodable according to this specification.");
    }
    return {"ftype":ftype,"nqis":nqis,"qis":qis};

};

/**
 * 7.2 - incorporates both 7.2.1 (long) and 7.2.2 (short)
 * only difference between the two is huffman coding used and step 12 doesnt exist in 7.2.2
 * @param nbits number of bits to decode
 * @param isLong whether the decode process is long or short form
 *
 * @returns {string}
 */
TheoraFrameDecoder.prototype.decodeVariableRunBitString = function(nbits,isLong)
{
    // 1
    var len = 0;

    // 2
    var bits = "";

    // 3
    if(len == nbits)
    {
        return bits;
    }

    // 4

    var bit = this.raw.readBits(1);
    var huff_bit,huff_code,huff_info;
    var rstart, rbits;
    var roffs, rlen, rep_bits;

    huff_code ="";
    // 14
    while(true){
        // while we havent found a valid code continue
        while(!rstart)
        {

            // 5
            huff_bit = this.raw.readBits(1);
            huff_code = (huff_code << 1) | huff_bit;
            if(isLong)
            {
                huff_info = TheoraFrameDecoder.getLongRunHuffmanBits(huff_code);
            }
            else
            {
                huff_info = TheoraFrameDecoder.getShortRunHuffmanBits(huff_code);
            }

            if(huff_info)
            {
                // 6
                rstart = huff_info["rstart"];
                rbits = huff_info["rbits"];
            }
        }
        // 7
        roffs = this.raw.readBits(rbits);

        // 8
        rlen = rstart+roffs;

        // 9

        rep_bits = parseInt(new Array( rlen + 1 ).join( bit.toString(2)));
        bits = (bits << rlen) | rep_bits;

        // 10
        len += rlen;

        if(len > nbits)
        {
            throw new Error("TheoraFrameDecoder.decodeLongRunBitString: 7.2.1.10 len > nbits ");
        }

        // 11
        if (len == nbits)
        {
            break;
        }

        // 12
        if(isLong && rlen == 4129)
        {
            bit = this.raw.readBits(1);
        }
        // 13
        else
        {
            bit = 1 - bit;
        }

    }
    return bits;

};


/**
 *
 * @param code - bit string for which huffman coding will be used
 * @returns {*} a container holding rbits and rstart
 */
TheoraFrameDecoder.getLongRunHuffmanBits = function(code)
{
    if(code.toString(2).length > 6)
    {
        throw new Error("TheoraFrameDecoder.getLongRunHuffmanBits: code longer than 6 bits");
    }

    var table_7_7 = {};
    table_7_7[parseInt("0",2)] =  {"rstart": 1 , "rbits": 0};
    table_7_7[parseInt("10",2)] =  {"rstart": 2 , "rbits": 1};
    table_7_7[parseInt("110",2)] =  {"rstart": 4 , "rbits": 1};
    table_7_7[parseInt("1110",2)] =  {"rstart": 6 , "rbits": 2};
    table_7_7[parseInt("11110",2)] =  {"rstart": 10 , "rbits": 3};
    table_7_7[parseInt("111110",2)] =  {"rstart": 18, "rbits": 4};
    table_7_7[parseInt("111111",2)] =  {"rstart": 34, "rbits": 12};

    return table_7_7[code];

};

/**
 *
 * @param code - bit string for which huffman coding will be used
 * @returns {*} a container holding rbits and rstart
 */
TheoraFrameDecoder.getShortRunHuffmanBits = function(code)
{
    if(code.toString(2).length > 5)
    {
        throw new Error("TheoraFrameDecoder.getShortRunHuffmanBits: code longer than 5 bits");
    }

    var table_7_11 = {};
    table_7_11[parseInt("0",2)] =  {"rstart": 1 , "rbits": 1};
    table_7_11[parseInt("10",2)] =  {"rstart": 3 , "rbits": 1};
    table_7_11[parseInt("110",2)] =  {"rstart": 5 , "rbits": 1};
    table_7_11[parseInt("1110",2)] =  {"rstart": 7 , "rbits": 2};
    table_7_11[parseInt("11110",2)] =  {"rstart": 11 , "rbits": 2};
    table_7_11[parseInt("11111",2)] =  {"rstart": 15, "rbits": 4};

    return table_7_11[code];

};


/**
 *
 */
TheoraFrameDecoder.prototype.decodeCodedBlockFlags = function()
{

};