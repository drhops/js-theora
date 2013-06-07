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

/********************************
******** CLASS VARIABLES ********
*********************************/

/**
 * Table 7.7
 * @type {{}}
 */
TheoraFrameDecoder.TABLE_7_7 = {};
TheoraFrameDecoder.TABLE_7_7[parseInt("0",2)] =  {"rstart": 1 , "rbits": 0};
TheoraFrameDecoder.TABLE_7_7[parseInt("10",2)] =  {"rstart": 2 , "rbits": 1};
TheoraFrameDecoder.TABLE_7_7[parseInt("110",2)] =  {"rstart": 4 , "rbits": 1};
TheoraFrameDecoder.TABLE_7_7[parseInt("1110",2)] =  {"rstart": 6 , "rbits": 2};
TheoraFrameDecoder.TABLE_7_7[parseInt("11110",2)] =  {"rstart": 10 , "rbits": 3};
TheoraFrameDecoder.TABLE_7_7[parseInt("111110",2)] =  {"rstart": 18, "rbits": 4};
TheoraFrameDecoder.TABLE_7_7[parseInt("111111",2)] =  {"rstart": 34, "rbits": 12};

/**
 * Table 7.11
 * @type {{}}
 */

TheoraFrameDecoder.TABLE_7_11 = {};
TheoraFrameDecoder.TABLE_7_11[parseInt("0",2)] =  {"rstart": 1 , "rbits": 1};
TheoraFrameDecoder.TABLE_7_11[parseInt("10",2)] =  {"rstart": 3 , "rbits": 1};
TheoraFrameDecoder.TABLE_7_11[parseInt("110",2)] =  {"rstart": 5 , "rbits": 1};
TheoraFrameDecoder.TABLE_7_11[parseInt("1110",2)] =  {"rstart": 7 , "rbits": 2};
TheoraFrameDecoder.TABLE_7_11[parseInt("11110",2)] =  {"rstart": 11 , "rbits": 2};
TheoraFrameDecoder.TABLE_7_11[parseInt("11111",2)] =  {"rstart": 15, "rbits": 4};

/**
 * Table 7.19
 * @type {{}}
 */

TheoraFrameDecoder.TABLE_7_19 = {};
TheoraFrameDecoder.TABLE_7_19[parseInt("0",2)] = 0;
TheoraFrameDecoder.TABLE_7_19[parseInt("10",2)] = 1;
TheoraFrameDecoder.TABLE_7_19[parseInt("110",2)] = 2;
TheoraFrameDecoder.TABLE_7_19[parseInt("1110",2)] = 3;
TheoraFrameDecoder.TABLE_7_19[parseInt("11110",2)] = 4;
TheoraFrameDecoder.TABLE_7_19[parseInt("111110",2)] = 5;
TheoraFrameDecoder.TABLE_7_19[parseInt("1111110",2)] = 6;
TheoraFrameDecoder.TABLE_7_19[parseInt("1111111",2)] = 7;

/**
 * Table 7.23
 * @type {{}}
 */

TheoraFrameDecoder.TABLE_7_23 = {};
TheoraFrameDecoder.TABLE_7_23[parseInt("000",2)] = 0;
TheoraFrameDecoder.TABLE_7_23[parseInt("001",2)] = 1;
TheoraFrameDecoder.TABLE_7_23[parseInt("0110",2)] = 2;
TheoraFrameDecoder.TABLE_7_23[parseInt("1000",2)] = 3;
TheoraFrameDecoder.TABLE_7_23[parseInt("101000",2)] = 4;
TheoraFrameDecoder.TABLE_7_23[parseInt("101010",2)] = 5;
TheoraFrameDecoder.TABLE_7_23[parseInt("101100",2)] = 6;
TheoraFrameDecoder.TABLE_7_23[parseInt("101110",2)] = 6;
TheoraFrameDecoder.TABLE_7_23[parseInt("1100000",2)] = 8;
TheoraFrameDecoder.TABLE_7_23[parseInt("1100010",2)] = 9;
TheoraFrameDecoder.TABLE_7_23[parseInt("1100100",2)] = 10;
TheoraFrameDecoder.TABLE_7_23[parseInt("1100110",2)] = 11;
TheoraFrameDecoder.TABLE_7_23[parseInt("1101000",2)] = 12;
TheoraFrameDecoder.TABLE_7_23[parseInt("1101010",2)] = 13;
TheoraFrameDecoder.TABLE_7_23[parseInt("1101100",2)] = 14;
TheoraFrameDecoder.TABLE_7_23[parseInt("1101110",2)] = 15;
TheoraFrameDecoder.TABLE_7_23[parseInt("11100000",2)] = 16;
TheoraFrameDecoder.TABLE_7_23[parseInt("11100010",2)] = 17;
TheoraFrameDecoder.TABLE_7_23[parseInt("11100100",2)] = 18;
TheoraFrameDecoder.TABLE_7_23[parseInt("11100110",2)] = 19;
TheoraFrameDecoder.TABLE_7_23[parseInt("11101000",2)] = 20;
TheoraFrameDecoder.TABLE_7_23[parseInt("11101010",2)] = 21;
TheoraFrameDecoder.TABLE_7_23[parseInt("11101100",2)] = 22;
TheoraFrameDecoder.TABLE_7_23[parseInt("11101110",2)] = 23;
TheoraFrameDecoder.TABLE_7_23[parseInt("11110000",2)] = 24;
TheoraFrameDecoder.TABLE_7_23[parseInt("11110010",2)] = 25;
TheoraFrameDecoder.TABLE_7_23[parseInt("11110100",2)] = 26;
TheoraFrameDecoder.TABLE_7_23[parseInt("11110110",2)] = 27;
TheoraFrameDecoder.TABLE_7_23[parseInt("11111000",2)] = 28;
TheoraFrameDecoder.TABLE_7_23[parseInt("11111010",2)] = 29;
TheoraFrameDecoder.TABLE_7_23[parseInt("11111100",2)] = 30;
TheoraFrameDecoder.TABLE_7_23[parseInt("11111110",2)] = 31;
TheoraFrameDecoder.TABLE_7_23[parseInt("010",2)] = -1;
TheoraFrameDecoder.TABLE_7_23[parseInt("111",2)] = -2;
TheoraFrameDecoder.TABLE_7_23[parseInt("1001",2)] = -3;
TheoraFrameDecoder.TABLE_7_23[parseInt("101001",2)] = -4;
TheoraFrameDecoder.TABLE_7_23[parseInt("101011",2)] = -5;
TheoraFrameDecoder.TABLE_7_23[parseInt("101101",2)] = -6;
TheoraFrameDecoder.TABLE_7_23[parseInt("101111",2)] = -7;
TheoraFrameDecoder.TABLE_7_23[parseInt("1100001",2)] = -8;
TheoraFrameDecoder.TABLE_7_23[parseInt("1100011",2)] = -9;
TheoraFrameDecoder.TABLE_7_23[parseInt("1100101",2)] = -10;
TheoraFrameDecoder.TABLE_7_23[parseInt("1100111",2)] = -11;
TheoraFrameDecoder.TABLE_7_23[parseInt("1101001",2)] = -12;
TheoraFrameDecoder.TABLE_7_23[parseInt("1101011",2)] = -13;
TheoraFrameDecoder.TABLE_7_23[parseInt("1101101",2)] = -14;
TheoraFrameDecoder.TABLE_7_23[parseInt("1101111",2)] = -15;
TheoraFrameDecoder.TABLE_7_23[parseInt("11100001",2)] = -16;
TheoraFrameDecoder.TABLE_7_23[parseInt("11100011",2)] = -17;
TheoraFrameDecoder.TABLE_7_23[parseInt("11100101",2)] = -18;
TheoraFrameDecoder.TABLE_7_23[parseInt("11100111",2)] = -19;
TheoraFrameDecoder.TABLE_7_23[parseInt("11101001",2)] = -20;
TheoraFrameDecoder.TABLE_7_23[parseInt("11101011",2)] = -21;
TheoraFrameDecoder.TABLE_7_23[parseInt("11101101",2)] = -22;
TheoraFrameDecoder.TABLE_7_23[parseInt("11101111",2)] = -23;
TheoraFrameDecoder.TABLE_7_23[parseInt("11110001",2)] = -24;
TheoraFrameDecoder.TABLE_7_23[parseInt("11110011",2)] = -25;
TheoraFrameDecoder.TABLE_7_23[parseInt("11110101",2)] = -26;
TheoraFrameDecoder.TABLE_7_23[parseInt("11110111",2)] = -27;
TheoraFrameDecoder.TABLE_7_23[parseInt("11111001",2)] = -28;
TheoraFrameDecoder.TABLE_7_23[parseInt("11111011",2)] = -29;
TheoraFrameDecoder.TABLE_7_23[parseInt("11111101",2)] = -30;
TheoraFrameDecoder.TABLE_7_23[parseInt("11111111",2)] = -31;


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
    var isPacket = this.raw.readBitAsInteger();

    if(isPacket == 1)
    {
        throw new Error("TheoraFrameDecoder:decodeFrameHeader: invalid packet");
    }

    // 2

    // This is the type of frame being decoded, as given in Table 7.3.
    // If this is the first frame being decoded this MUST be zero.

    var ftype = this.raw.readBitAsInteger();

    // 3

    // An NQIS-element array of qi values.
    var qis = [];

    qis[0] = this.raw.readBitsAsInteger(6,false);

    // 4

    var nqis;

    var moreqis = this.raw.readBitAsInteger();
// 5
    if(moreqis == 0)
    {

        nqis=1;
    }
    // 6
    else
    {
        // 6a
        qis[1]=this.raw.readBitsAsInteger(6,false);

        // 6b

        moreqis = this.raw.readBitAsInteger();
        // 6c
        if(moreqis == 0)
        {
            nqis = 2;
        }
        // 6d
        else
        {
            // 6di
            qis[2]=this.raw.readBitsAsInteger(6,false);
            // 6dii
            nqis = 3;
        }
    }

    // 7
    if (ftype == 0)
    {
        this.raw.readBitsAsInteger(3,false);
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

    var bit = this.raw.readBitAsInteger();
    var huff_info;
    var rstart, rbits;
    var roffs, rlen;
    var bitsByte=0;
    var bitsByteLen=0;
    // 14
    while(true){
        // while we havent decoded nbits

        if(isLong)
        {
            huff_info = this.decodeUntilHuffmanCodeReached(TheoraFrameDecoder.getLongRunHuffmanBits);
        }
        else
        {
            huff_info = this.decodeUntilHuffmanCodeReached(TheoraFrameDecoder.getShortRunHuffmanBits);
        }

        rstart = huff_info["rstart"];
        rbits = huff_info["rbits"];

        // 7
        roffs = this.raw.readBitsAsInteger(rbits,false);

        // 8
        rlen = rstart+roffs;

        // 9

        // done this way because bits can be of length 2^36 bits, so it must be a string
        // thus every 8 bits read gets turned into a character and added to bits
        var i;
        for(i=0;i<rlen;i++)
        {
            // increase length of bitsByte
            bitsByteLen +=1;
            // add a bit to bitsByte
            bitsByte = (bitsByte << 1) | bit;

            // if this is 8th bit added to bitsByte
            if(bitsByteLen == 8)
            {
                // turn bitsByte into a char and add to bits
                bits += String.fromCharCode(bitsByte);
                // reset bits Byte
                bitsByteLen=0;
                bitsByte=0;

            }
        }

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
            bit = this.raw.readBitAsInteger();
        }
        // 13
        else
        {
            bit = 1 - bit;
        }

    }

    // we have remaining bits tot urn into a byte
    if(bitsByteLen >0)
    {
        // add remaining 0s to bitsByte to turn into full byte
        bitsByte = (bitsByte << 8 - bitsByteLen);
        // add to bits
        bits += String.fromCharCode(bitsByte);
    }
    return bits;

};

/**
 * 7.2.1
 * @param nbits
 */
TheoraFrameDecoder.prototype.decodeLongRunBitString = function(nbits)
{
    this.decodeVariableRunBitString(nbits,true);
};

/**
 * 7.2.2
 * @param nbits
 */
TheoraFrameDecoder.prototype.decodeShortRunBitString = function(nbits)
{
    this.decodeVariableRunBitString(nbits,false);
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


    return TheoraFrameDecoder.TABLE_7_7[code];

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


    return TheoraFrameDecoder.TABLE_7_11[code];

};


/**
 *  7.3 Coded Block Flags Decode
 */
TheoraFrameDecoder.prototype.decodeCodedBlockFlags = function(ftype,nsbs,nbs,bcoded)
{
    var sbpcoded=[];
    var sbfcoded=[];

    var nbits;

    var sbi;
    var bi;

    // 1
    // intra frame
    if (ftype==0)
    {
        for (bi =0;bi<nbs;bi++)
        {
            bcoded[bi]=1;
        }
    }
    // 2
    // inter frame
    else
    {
        // 2a
        nbits = nsbs;

        // 2b
        // wrap bits with the rawData class for easy reading
        // represents list of partially decoded super blocks
        var rawPartialBits = new RawData(this.decodeLongRunBitString(nbits));

        // number of non-partial super
        var numNonPartial=0;

        // 2c
        // nbits is equal to nsbs, (number of bits unpacked into rawBits)

        for(sbi=0;sbi<nsbs;sbi++)
        {
            // not signed
            var isPartial = rawPartialBits.readBitAsInteger();

            numNonPartial += isPartial ? 0 : 1;
            sbpcoded[sbi]= isPartial;

        }

        // 2d
        nbits = numNonPartial;

        // 2e
        // represents list of fully decoded super blocks
        var rawFullBits = new RawData(this.decodeLongRunBitString(nbits));

        var numBlocks=0;
        for(sbi=0;sbi<nsbs;sbi++)
        {
            if(sbpcoded[sbi]==0)
            {
                // 2f
                sbfcoded[sbi]= rawFullBits.readBitAsInteger();
            }
            else
            {
                // 2g
                numBlocks++;
            }

        }

        // 2g
        nbits = numBlocks;

        // 2h
        var rawBlockBits = new RawData(this.decodeShortRunBitString(nbits));

        // 2i
        for(bi=0;bi<nbs;bi++)
        {
            // 2i.i
            sbi = Math.floor(bi / 16);
            // 2i.ii
            if(sbpcoded[sbi] == 0)
            {
                bcoded[bi]=sbfcoded[sbi];
            }
            // 2i.iii
            else
            {
                bcoded[bi] = rawBlockBits.readBitAsInteger();
            }

        }

    }
    return bcoded;
};


TheoraFrameDecoder.prototype.decodeMacroBlockCodingModes= function(ftype,nmbs,nbs,bcoded)
{
    var mscheme;
    var malphabet = [];
    var mbmodes = [];
    var mbi,bi,mi;
    var mode;
    // 1 (intra frame)
    // all macro blocks in an intra frame have coding Mode of INTRA
    if( ftype == 0 )
    {
        // 1a
        for (mbi =0 ; mbi < nmbs ; mbi++)
        {
            mbmodes = 1;
        }
    }
    // 2
    // inter frame
    else
    {
        // 2a
        mscheme = this.raw.readBitsAsInteger(3,false);

        // 2b
        if( mscheme == 0 )
        {
            // 2b.i
            // For each consecutive value of MODE from 0 to 7, inclusive:

            for(mode = 0; mode <8;mode++)
            {
                // 2b.i.A
                mi = this.raw.readBitsAsInteger(3,false);
                // 2b.i.B
                malphabet[mi]=mode;

            }
        }
        // 2c
        else if(mscheme != 7)
        {
            malphabet = TheoraFrameDecoder.getMacroModeBlockAlphabet(mscheme);
        }

        var isLumaCoded;
        var biStart;
        // 2d
        for (mbi =0;mbi*4<nbs;mbi++)
        {

            // 2d.i

            // iterates through blocks in this macroblocks luma frame
            // aslo make sure the bi is < nbs
            isLumaCoded=false;

            biStart = mbi*4;
            for(bi = biStart; bi < biStart+4 && bi < nbs;bi++)
            {
                if(bcoded[bi]==1)
                {
                    isLumaCoded = true;
                    break;
                }
            }

            // 2d.i
            if(isLumaCoded)
            {
                // 2d.i.A
                if(mscheme != 7 )
                {
                    mi = this.decodeUntilHuffmanCodeReached(TheoraFrameDecoder.getMacroModeBlockHuffmanIndex);
                    mbmodes[mbi] = malphabet[mi];
                }
                else
                // 2d.i.A
                {

                    mbmodes[mbi] = this.raw.readBitsAsInteger(3,false);
                }
            }
            // 2d.ii
            else
            {
                mbmodes[mbi]=0;
            }
        }
    }
};


/**
 * Table 7.23
 * Huffman Codes for Motion Vector Components
 * returns the huffman Coode value for the input huffmancode
 * @param code
 * @returns {*}
 */
TheoraFrameDecoder.getMVCHuffmanCode = function(code)
{

    if(code.toString(2).length > 7)
    {
        throw new Error("TheoraFrameDecoder.getLongRunHuffmanBits: code longer than 6 bits");
    }






    return TheoraFrameDecoder.TABLE_7_23[code];

};

/**
 * Table 7.19
 * @param code
 * @returns {*}
 */

TheoraFrameDecoder.getMacroModeBlockHuffmanIndex = function(code)
{

    if(code.toString(2).length > 7)
    {
        throw new Error("TheoraFrameDecoder.getLongRunHuffmanBits: code longer than 6 bits");
    }



    return TheoraFrameDecoder.TABLE_7_19[code];

};
/**
 * Table 7.19
 * @param scheme
 */

TheoraFrameDecoder.getMacroModeBlockAlphabet = function(scheme)
{
    if(scheme <1 || scheme >6)
    {
        throw new Error("TheoraFrameDecoder.getMacroModeBlockSchemes: Can't get mode for scheme: "+ scheme);
    }

    var alphabet;
    switch (scheme)
    {
        case 1:
            alphabet = [3,4,2,0,1,5,6,7];
            break;
        case 2:
            alphabet = [3,4,0,2,1,5,6,7];
            break;
        case 3:
            alphabet = [3,2,4,0,1,5,6,7];
            break;
        case 4:
            alphabet = [3,2,0,4,1,5,6,7];
            break;
        case 5:
            alphabet = [0,3,4,2,1,5,6,7];
            break;
        case 6:
            alphabet = [0,5,3,4,2,1,6,7];
            break;

    }
    return alphabet;
};

TheoraFrameDecoder.prototype.decodeUntilHuffmanCodeReached = function(huffFn)
{
    var huffInfo;
    var huffCode;
    while(!huffInfo)
    {
        huffCode = (huffCode << 1) | this.raw.readBitAsInteger();
        huffInfo = huffFn(huffCode);
    }
    return huffInfo;
};
/**
 * 7.5.1
 * @param mvmode the motion vector decoding method. 
  */
TheoraFrameDecoder.prototype.decodeMotionVectors = function(mvmode)
{
    // The sign of the motion vector compoent just decoded.
    var mvx,mvy;
    var mvsign;

    // 1
    if (mvmode == 0)
    {
        // 1a
        mvx=this.decodeUntilHuffmanCodeReached(TheoraFrameDecoder.getMVCHuffmanCode);
        // 1b
        mvy=this.decodeUntilHuffmanCodeReached(TheoraFrameDecoder.getMVCHuffmanCode);
    }
    // 2
    else
    {
        // 2a
        mvx= this.raw.readBitsAsInteger(5,false);
        // 2b
        mvsign = this.raw.readBitAsInteger();
        // 2c
        if(mvsign == 1)
        {
            mvx = -mvx;
        }

        // 2d
        mvy= this.raw.readBitsAsInteger(5,false);
        // 2e
        mvsign = this.raw.readBitAsInteger();
        // 2f
        if(mvsign == 1)
        {
            mvy = -mvy;
        }

    }
    return {"mvx":mvx,"mvy":mvy};
};