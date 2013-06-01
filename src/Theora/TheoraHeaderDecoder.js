/**
 * Object that takes in a RawData that is pointing to encoded header data and decodes it
 * @constructor
 */
var TheoraHeaderDecoder = function()
{
    this.header = new TheoraHeader();
};


/**
 *
 * @param raw
 */
TheoraHeaderDecoder.prototype.decodePacket = function (raw) {
    // http://wiki.xiph.org/OggTheora
    //https://vob2mkv.svn.codeplex.com/svn/tags/release-1.0.1/mkvmerge/common/theora.cpp
    // 6.1
    var packType = 0;
    var a=true;
    if(a)
    {
        packType =raw.readByteAsInteger();
    }

    console.log("Type is " + packType);

    var codec = raw.readBytes(6);

    if (codec !== "theora") {
        throw new Error("Bad codec " + codec);
    }

    if (packType === 0x80) {
        this.decodeIdHeader(raw);
    } else if (packType === 0x81) {
        this.decodeCommentHeader(raw);
    } else if (packType == 0x82) {
        this.decodeSetupHeader(raw);
    } else {
        throw new Error("Bad header type " + packType);
    }

};


/**
 * decodes comment header data
 * @returns {} header
 */
TheoraHeaderDecoder.prototype.decodeCommentHeader = function (raw) {


    var readerFn = function () {
        var commentLength = 0;
        for (var i=0; i < 4; i++) {
            var bite = raw.readByteAsInteger();
            commentLength |= (bite << (i*8));
        }

        return commentLength;
    };

    var commentLength = readerFn();

    this.header.vendor =raw.readAsString(commentLength);

    this.header.comments = [];
    var numComments = readerFn();
    for (var i=0; i < numComments; i++) {
        var commentLen = readerFn();
        this.header.comments.push(raw.readAsString(commentLen));
    }

    return this.header;
};


/**
 *  #### TheoraHeaderDecoder.prototype.decodeQuantParams() should be called immediately after this ###
 *
 *
 */
TheoraHeaderDecoder.prototype.decodeLoopFilterLimitTable = function (raw) {
    // Section 6.4.1


    // Theora Section 6.4.1
    // Loop Filter Limit Table Decode

    var nbits = raw.readBitsAsInteger(3,false);



    for (var i = 0; i < 64; i++) {
        this.header.lflims.push(raw.readBitsAsInteger(nbits,false));
    }

};


/**
 *  #### TheoraHeaderDecoder.prototype.decodeDCTHuffTables() should be called immediately after this ###
 *
 *
 */

TheoraHeaderDecoder.prototype.decodeQuantParams = function (raw) {
    var i;
    var nbits = raw.readBitsAsInteger(4,false) + 1;

    // step 2
    this.header.acscale = [];
    for (i = 0; i < 64; i++) {
        // step 2a
        this.header.acscale.push(raw.readBitsAsInteger(nbits,false));
    }

    // step 3
    nbits = raw.readBitsAsInteger(4,false) + 1;

    // step 4

    this.header.dcscale = [];
    for (i = 0; i < 64; i++) {
        // step 4a
        this.header.dcscale.push(raw.readBitsAsInteger(nbits,false));
    }

    // step 5
    this.header.nbms = raw.readBitsAsInteger(9,false) + 1;
    if (this.header.nbms > 384) {
        throw new Error("Invalid nbms " + this.header.nbms);
    }

    // step 6

    // bms represents a 2d array BMS[bmi][ci]
    this.header.bms = [];

    for (i = 0; i < 64 * this.header.nbms; i++) {
        // step 6a
        this.header.bms.push(raw.readByteAsInteger());
    }

    // nqrs represents a 2d array NQRS[qti][pli]
    this.header.nqrs = [];
    // qrsizes represents a 2d array QRSIZES[qti][pli]
    this.header.qrsizes = [];
    // qrbmis represents a 2d array QRBMIS[qti][pli]
    this.header.qrbmis = [];
    // 7
    for (var qti = 0; qti < 2; qti++) {
        // 7a
        for (var pli = 0; pli < 3; pli++) {

            // 7ai, 7aii
            var newQr;

            if (qti > 0 || pli > 0) {
                newQr = raw.readBitsAsInteger(1,false);
            }
            else {
                newQr = 1;
            }
            //7a iii

            if (newQr === 0) {
                // copying old quant ranges

                // 7aiii - A,B
                var rpqr;
                if (qti > 0) {
                    rpqr = raw.readBitsAsInteger(1,false);
                }
                else {
                    rpqr = 0;
                }

                // 7aiii - C,D
                var qtj, plj;
                if (rpqr === 1) {
                    qtj = qti - 1;
                    plj = pli;
                } else {
                    qtj = Math.floor((3 * qti + pli - 1) / 3);
                    plj = (pli + 2) % 3;
                }

                // 7aiii - E,F,G
                var old_nqrs = this.header.getNQRSAt(qtj, plj);
                var old_qrsizes,old_bmis;
                this.header.setNQRSAt(qti, pli,old_nqrs);
                for (i = 0; i < 64; i++) {

                    if (i < 63) {
                        // this only has 63 entries compared to the 64 of qrbmis
                        // do update for 0 - 63
                        old_qrsizes = this.header.getQrSizesAt(qtj, plj, i);
                        this.header.setQrSizesAt(qti, pli, i,old_qrsizes);
                    }

                    old_bmis=this.header.getQrBMISAt(qtj, plj, i);
                    this.header.setQrBMISAt(qti, pli, i,old_bmis);

                }
            } else if (newQr === 1) {
                // 7a iv
                // new set of quant ranges

                // 7a iv - A,B
                var qri = 0, qi = 0;

                // 7a iv - C
                var readLen = TheoraUtils.ilog(this.header.nbms - 1);

                var readBmis = raw.readBitsAsInteger(readLen,false);

                if (readBmis >= this.header.nbms) {
                    // the read bits are larger than expected
                    throw new Error("TheoraHeaderDecoder.prototype.decodeQuantParams: Stream is undecodable");
                }

                this.header.setQrBMISAt(qti, pli, qri,readBmis);


                while (true) {

                    // 7a iv - D
                    var readValue = raw.readBitsAsInteger(TheoraUtils.ilog(62 - qi),false) + 1;

                    this.header.setQrSizesAt(qti, pli, qri,readValue);
                    // 7a iv - E
                    qi += readValue;
                    // 7a iv - F
                    qri++;

                    // 7a iv - G
                    this.header.setQrBMISAt(qti, pli, qri,raw.readBitsAsInteger(readLen,false));


                    if (qi > 63) {
                        // 7a iv - I
                        throw new Error("TheoraHeaderDecoder.prototype.decodeQuantParams: Stream is undecodable");

                    } else if (qi === 63) {
                        break;
                    }
                    // 7a iv - H
                }
                // 7a iv - J
                this.header.setNQRSAt(qti, pli,qri);
            } else {
                throw new Error("newQr is " + newQr);
            }
        }
    }

};

/**
 * 6.4.4 DCT Token Human Tables
 * returns An 80-element array of Human tables with up to 32 entries each. *
 *
 *
 *
 */

TheoraHeaderDecoder.prototype.decodeDCTTokenHuffTables = function (raw) {
    //6.4.4 DCT Token Human Tables

    var hts = [];

    // 1
    for (var hti = 0; hti < 80; hti++) {
        // 1a
        var hbits = "";
        // 1b-e
        this.decodeHuffRecurHelper(raw,hts, hti, hbits);
    }

    this.header.hts = hts;

};

/**
 * recursive helper function that reads in one of the 80 huff tables

 */

TheoraHeaderDecoder.prototype.decodeHuffRecurHelper = function(raw,hts,hti,hbits)
{
    // 6.4.4 DCT Token Human Tables
    // 1b
    if(hbits.toString(2).length >32)
    {
        return;
    }

    // 1c
    var isleaf = raw.readBitsAsInteger(1,false);

    // 1d
    if (isleaf)
    {
        // 1di - check to make sure we arent reading into a table that already has 32 etires
        if(hts.length - hti*32 >= 32)
        {
            throw new Error("TheoraHeaderDecoder.prototype.decodeDCTTokenHuffTables(): The number of entries in table HTS[hti] is already 32. The stream is undecodeable.");

        }
        // 1d ii
        var token = raw.readBitsAsInteger(5,false);
        // 1d iii
        hts.push([hbits,token]);
    }
    // 1e
    else
    {
        // 1e i
        var hbits0 = (hbits << 1);
        // 1e ii
        this.decodeHuffRecurHelper(raw,hts,hti,hbits0);

        // 1e iii
        var hbits1 = (hbits << 1) | 1;
        // 1e iv
        this.decodeHuffRecurHelper(raw,hts,hti,hbits1);
    }
};

TheoraHeaderDecoder.prototype.decodeSetupHeader = function (raw) {
    // http://www.theora.org/doc/Theora.pdf
    // Section 6.4.5
    // preforms:
    // 6.4.1
    // 6.4.2
    // 6.4.4


    // 6.4.1 LFLIMS decode
    this.decodeLoopFilterLimitTable(raw);

    // 6.4.2 Quantization Parameters Decode
    this.decodeQuantParams(raw);

    // 6.4.4 DCT Token Human Tables
    this.decodeDCTTokenHuffTables(raw);

};


/*
 * 6.4.3 Computing a Quantization Matrix

 * creates a 64-element array of quantization values for each DCT coefficient in natural order
 *
 * The following procedure can be used to generate a single quantization matrix
 * for a given quantization type, color plane, and qi value, given the quantization
 * parameters decoded in Section 6.4.2.
 *
 * Note that the product of the scale value and the base matrix value is in units
 * of 100ths of a pixel value, and thus is divided by 100 to return it to units of a
 * single pixel value. This value is then scaled by four, to match the scaling of the
 * DCT output, which is also a factor of four larger than the orthonormal version
 * of the transform.
 */

TheoraHeaderDecoder.prototype.computeQMat = function(raw,qti,pli,qi,header)
{

    // 6.4.3 Computing a Quantization Matrix

    // choose qri such that qi is >= to sum of before qri
    // and adding the next index will be >= qri
    var qri =0;

    var prevsum =0;
    var sum;
    var qri_set =0;

    // i = the qri that we are testing

    for (var i =0; i< 63;i++)
    {
        // prevsum = SUM( QRSIZES[qti,pli,0...i-1] )
        // sum = SUM( QRSIZES[qti,pli,0...i] )

        sum = prevsum + header.qrsizes(this.header.getQrSizesAt(qti, pli, i));


        if(qi >= prevsum && qi <= sum)
        {
            // found qri that meets conditions
            qri = i;
            qri_set = 1;
            break;
        }
        prevsum=sum;
    }

    if(! qri_set )
    {
        throw new Error("TheoraHeaderDecoder.prototype.computeQMat: suitable qri not found");
    }

    // 2
    var qistart = prevsum;

    // 3
    var qiend = sum;

    // 4
    var bmi = header.qrbmis(this.header.getQrBMISAt(qti,pli,qri));

    // 5
    var bmj = header.qrbmis(this.header.getQrBMISAt(qti,pli,qri+1));

    var qrs = header.qrsizes(this.header.getQrSizesAt(qti,pli,qri));

    var qmat=[]                                                             ;
    var bm = [];
    // 6
    for( var ci =0 ; ci < 64; ci++)
    {
        // 6a
        var bms_i = header.bms(this.header.getBMSAt(bmi,ci));
        var bms_j = header.bms(this.header.getBMSAt(bmj,ci));


        bm[ci] = Math.floor(((2*qiend-qi)*bms_i  + 2*(qi-qistart)*bms_j+qrs)/(2*qrs));

        // 6b
        // ci == 0, qti == 0 | qmin = 2^(3+1+0) = 16
        // ci > 0, qti == 0  | qmin = 2^(3+0+0) = 8
        // ci == 0, qti == 1 | qmin = 2^(3+1+1) = 32
        // ci > 0, qti == 1  | qmin = 2^(3+0+1) = 16

        var qmin = 2^(3 +(ci > 0 ? 0:1)+qti);

        // 6c,d
        var qscale = ( ci == 0 ? header.dcscale[qi] : header.acscale[qi]);

        // 6e
        qmat [ci] = Math.max(qmin,Math.min(Math.floor(qscale*bm[ci]/100)*4,4096));

    }
    return qmat;
};


/**
 * 6.2
 *
 * @param raw
 */
TheoraHeaderDecoder.prototype.decodeIdHeader = function (raw) {

    var vmaj = raw.readByteAsInteger();
    var vmin = raw.readByteAsInteger();
    var vrev = raw.readByteAsInteger();

    if (vmaj !== 3) {
        throw new Error("Theora major version: " + vmaj);
    }
    if (vmin !== 2) {
        throw new Error("Theora minor version: " + vmaj);

    }

    console.log("Theora version "+vmaj+"."+vmin+"." +vrev);



    // 5

    //Read a 16-bit unsigned integer as FMBW. This MUST be greater than
    // zero. This species the width of the coded frame in macro blocks. The
    // actual width of the frame in pixels is FMBW  16.
    this.header.fmbw = raw.readBytesAsInteger(2);
    if(this.header.fmbw <=0)
    {
        throw new Error("fmbw must be greater than 0")
    }
    this.header.fmbh = raw.readBytesAsInteger(2);

    if(this.header.fmbh <=0)
    {
        throw new Error("fmbh must be greater than 0")
    }

    console.log("fmbh: " + this.header.fmbh);

    // picture w/h and offset in pixels
    this.header.picw = raw.readBytesAsInteger(3);
    if(this.header.picw > this.header.fmbw *16)
    {
        throw new Error("picw must be greater than fmbw*16")
    }

    this.header.pich = raw.readBytesAsInteger(3);

    if(this.header.pich > this.header.fmbh *16)
    {
        throw new Error("pich must be greater than fmbh*16")
    }

    this.header.picx = raw.readBytesAsInteger(1);

    if(this.header.picx > this.header.fmbw*16 - this.header.picx)
    {
        throw new Error("picx must be greater than fmbw*16-picx")
    }

    this.header.picy = raw.readBytesAsInteger(1);

    if(this.header.picy > this.header.fmbh*16 - this.header.picy)
    {
        throw new Error("picy must be greater than fmbh*16-piy")
    }

    // frame rate numerator and denominator
    this.header.frn = raw.readBytesAsInteger(4);
    if (this.header.frn <= 0) {
        throw new Error("Frn is " + this.header.frn);
    }

    this.header.frd = raw.readBytesAsInteger(4);

    if (this.header.frd <= 0) {
        throw new Error("Frd is " + this.header.frd);
    }

    // pixel aspect ratio numerator + denominator
    this.header.parn = raw.readBytesAsInteger(3);

    this.header.pard = raw.readBytesAsInteger(3);

    if(this.header.parn*this.header.pard == 0){
        this.header.parn =1;
        this.header.pard =1;
    }

    // here's where it maybe gets screwy

    // colorspace
    this.header.cs = raw.readBytesAsInteger(1);

    // bitrate in bits/s
    this.header.nombr = raw.readBytesAsInteger(3);

    // quality hint
    this.header.qual = raw.readBitsAsInteger(6,false);

    // amount to shift keyframe by in the granule position
    this.header.kfgshift = raw.readBitsAsInteger(5,false);

    // pixelformat
    this.header.pf = raw.readBitsAsInteger(2,false);

    if(this.header.pf == 1)
    {
        throw new Error("pf is equal to 1 and the stream is non decodeable");
    }
    // reserved
    this.header.res = raw.readBitsAsInteger(3,false);

    if (this.header.res !== 0) {
        throw new Error("Reserved === " + this.header.res);
    }

    switch(this.header.pf)
    {
        case 0:
            this.header.nsbs = (Math.floor((this.header.fmbw+1)/2) * Math.floor((this.header.fmbh+1)/2)) +
                2 * (Math.floor((this.header.fmbw+3)/4) * Math.floor((this.header.fmbh+3)/4));

            this.header.nbs = 6*this.header.fmbw*this.header.fmbh;

            break;
        case 2:
            this.header.nsbs = (Math.floor((this.header.fmbw+1)/2) * Math.floor((this.header.fmbh+1)/2)) +
                2 * (Math.floor((this.header.fmbw+3)/4) * Math.floor((this.header.fmbh+1)/2));

            this.header.nbs = 8*this.header.fmbw*this.header.fmbh;

            break;
        case 3:
            this.header.nsbs = 3*(Math.floor((this.header.fmbw+1)/2) * Math.floor((this.header.fmbh+1)/2));

            this.header.nbs = 12*this.header.fmbw*this.header.fmbh;

            break;
    }

    this.header.nmbs=this.header.fmbh*this.header.fmbw;

    if ((0 != this.header.parn) && (0 != this.header.pard)) {
        if ((this.header.fmbw / this.header.fmbh) < (this.header.parn / this.header.pard)) {
            this.header.display_width  = Math.floor(this.header.fmbw * this.header.parn / this.header.pard);
            this.header.display_height = this.header.fmbh;
        } else {
            this.header.display_width  = this.header.fmbw;
            this.header.display_height = Math.floor(this.header.fmbh * this.header.pard / this.header.parn);
        }
    }

    this.header.display_height *= 16;
    this.header.display_width  *= 16;


};
;