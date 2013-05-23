/**
 * Object that takes in a RawData that is pointing to encoded header data and decodes it
  * @constructor
 */
OGVHeaderDecoder = function()
{
    this.header = new OGVHeader();
};


/**
 *
 * @param raw
 */
OGVHeaderDecoder.prototype.readSegment = function (raw) {
    // http://wiki.xiph.org/OggTheora
    //https://vob2mkv.svn.codeplex.com/svn/tags/release-1.0.1/mkvmerge/common/theora.cpp

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

OGVHeaderDecoder.prototype.decodeHeader = function (raw) {


    this.decodePageHeader(raw);
    var i;

    for (i=0; i < this.header.segmentSizes.length; i++) {
        this.readSegment(raw);
    }


    return this.header;
};


OGVHeaderDecoder.prototype.decodePageHeader = function (raw) {
    // http://en.wikipedia.org/wiki/Ogg_page



    // read OGG page
    // read ogg magic number from header "OggS"

    if (raw.readBytes(4) != "OggS")
    {
     throw new Error("Magic doesn't match");
    }



    // ** read page version (8 bits) **
    // version of the Ogg format. should be 0 for now
    this.header.version = raw.readByteAsInteger();

    if (this.header.version !== 0) {
        throw new Error("Version is " + this.header.version);
    }

    // ** read header type (8 bits) **

    // This is an 8 bit field of flags, which indicates the type of page that follows.
    // The rightmost or least significant bit is considered bit 0, with value 0x01,
    // the next least significant digit is bit 1, with value 0x02. The third is bit 2, with
    // value 0x04, and so on.

    this.header.headerType = raw.readByte();

    // ** read Granule Position (64 bits) **
    // A granule position is the time marker in Ogg files. It is an abstract value,
    // whose meaning is determined by the codec. It may for example be a count of the
    // number of samples, the number of frames or a more complex scheme.

    this.header.granulePos = raw.readBytes(8);


    // ** read bitstream serial number (32 bits) **
    // This field is a serial number that identifies a page as belonging to a particular logical
    // bitstream. Each logical bitstream in a file has a unique value, and this field allows
    // implementations to deliver the pages to the appropriate decoder. In a typical Vorbis
    // and Theora file, one stream is the audio (Vorbis), and the other is the video (Theora)


    this.header.serialNum  = raw.readBytesAsInteger(4);

    // ** read Page sequance number (32 bits) **
    // This field is a monotonically increasing field for each logical bitstream.
    //  The first page is 0, the second 1, etc. This allows implementations to detect when
    // data has been lost.

    this.header.pageSeqNum = raw.readBytesAsInteger(4);

    // ** read checksum (32 bits) **
    // used to make sure data isnt corrupted

    this.header.crc = raw.readBytesAsInteger(4);

    // ** read page segments (8 bits) **
    // This field indicates the number of segments that exist in this page.
    // It also indicates how many bytes are in the segment table that follows this field.
    // There can be a maximum of 255 segments in any one page.

    this.header.numberPageSegments = raw.readBytesAsInteger(1);

    this.header.segmentSizes = [];
    var packetSize = 0;
    var runningSegment = 0;

    // ** read segment table **
    // The segment table is an vector of 8-bit values, each indicating the length of the
    // corresponding segment within the page body. The number of segments is determined from
    // the preceding Page Segments field. Each segment is between 0 and 255 bytes in length.

    // The segments provide a way to group segments into packets, which are meaningful units of
    // data for the decoder. When the segment's length is indicated to be 255, this indicates that
    // the following segment is to be concatenated to this one and is part of the same packet.
    // When the segment's length is 0–254, this indicates that this segment is the final segment
    // in this packet. Where a packet's length is a multiple of 255, the final segment is length 0.

    // Where the final packet continues on the next page, the final segment value is 255, and the
    // continuation flag is set on the following page to indicate that the start of the new page
    // is a continuation of last page.

    for (var i=0; i < this.header.numberPageSegments; i++) {
        var segSize = raw.readByteAsInteger();
        packetSize += segSize;

        runningSegment += segSize;

        if (segSize < 255) {
            this.header.segmentSizes.push(runningSegment);
            runningSegment = 0;
        }
    }

    this.header.pageSize = packetSize;

};


/**
 * decodes comment header data
 * @returns {} header
 */
OGVHeaderDecoder.prototype.decodeCommentHeader = function (raw) {


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
 *  #### OGVHeaderDecoder.prototype.decodeQuantParams() should be called immediately after this ###
 *
 *
 */
OGVHeaderDecoder.prototype.decodeLoopFilterLimitTable = function (raw) {
    // Section 6.4.1


    // Theora Section 6.4.1
    // Loop Filter Limit Table Decode

    var nbits = raw.readBitsAsInteger(3,false);



    for (var i = 0; i < 64; i++) {
        this.header.lflims.push(raw.readBitsAsInteger(nbits,false));
    }

};


/**
 *  #### OGVHeaderDecoder.prototype.decodeDCTHuffTables() should be called immediately after this ###
 *
 *
 */

OGVHeaderDecoder.prototype.decodeQuantParams = function (raw) {
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
                var readLen = OGVHeaderDecoder.ilog(this.header.nbms - 1);

                var readBmis = raw.readBitsAsInteger(readLen,false);

                if (readBmis >= this.header.nbms) {
                    // the read bits are larger than expected
                    throw new Error("OGVHeaderDecoder.prototype.decodeQuantParams: Stream is undecodable");
                }

                this.header.setQrBMISAt(qti, pli, qri,readBmis);


                while (true) {

                    // 7a iv - D
                    var readValue = raw.readBitsAsInteger(OGVHeaderDecoder.ilog(62 - qi),false) + 1;

                    this.header.setQrSizesAt(qti, pli, qri,readValue);
                    // 7a iv - E
                    qi += readValue;
                    // 7a iv - F
                    qri++;

                    // 7a iv - G
                    this.header.setQrBMISAt(qti, pli, qri,raw.readBitsAsInteger(readLen,false));


                    if (qi > 63) {
                        // 7a iv - I
                        throw new Error("OGVHeaderDecoder.prototype.decodeQuantParams: Stream is undecodable");

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

OGVHeaderDecoder.prototype.decodeDCTTokenHuffTables = function (raw) {
    //6.4.4 DCT Token Human Tables

    var hts = [];

    // 1
    for (var hti = 0; hti < 80; hti++) {
        // 1a
        var hbits = "";
        // 1b-e
        OGVHeaderDecoder.prototype.decodeHuffRecurHelper(raw,hts, hti, hbits)
    }

    this.header.hts = hts;

};

/**
 * recursive helper function that reads in one of the 80 huff tables

 */

OGVHeaderDecoder.prototype.decodeHuffRecurHelper = function(raw,hts,hti,hbits)
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
            throw new Error("OGVHeaderDecoder.prototype.decodeDCTTokenHuffTables(): The number of entries in table HTS[hti] is already 32. The stream is undecodeable.");

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
        OGVHeaderDecoder.prototype.decodeHuffRecurHelper(raw,hts,hti,hbits0);

        // 1e iii
        var hbits1 = (hbits << 1) | 1;
        // 1e iv
        OGVHeaderDecoder.prototype.decodeHuffRecurHelper(raw,hts,hti,hbits1);
    }
};

OGVHeaderDecoder.prototype.decodeSetupHeader = function (raw) {
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

OGVHeaderDecoder.prototype.computeQMat = function(raw,qti,pli,qi,header)
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

        sum = prevsum + header.qrsizes(OGVHeaderDecoder.prototype.getQrSizesIndex(qti, pli, i));


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
        throw new Error("OGVHeaderDecoder.prototype.computeQMat: suitable qri not found");
    }

    // 2
    var qistart = prevsum;

    // 3
    var qiend = sum;

    // 4
    var bmi = header.qrbmis(OGVHeaderDecoder.prototype.getQrbmisIndex(qti,pli,qri));

    // 5
    var bmj = header.qrbmis(OGVHeaderDecoder.prototype.getQrbmisIndex(qti,pli,qri+1));

    var qrs = header.qrsizes(OGVHeaderDecoder.prototype.getQrSizesIndex(qti,pli,qri));

    var qmat=[]                                                             ;
    var bm = [];
    // 6
    for( var ci =0 ; ci < 64; ci++)
    {
        // 6a
        var bms_i = header.bms(OGVHeaderDecoder.prototype.getBMSIndex(bmi,ci,header.nbms));
        var bms_j = header.bms(OGVHeaderDecoder.prototype.getBMSIndex(bmj,ci,header.nbms));


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



OGVHeaderDecoder.prototype.decodeIdHeader = function (raw) {
    var version = raw.readBytesAsInteger(3);
    if (version !== 197121) {
        throw new Error("Theora version: " + version);
    }



    // frame w/h in macroblocks
    this.header.fmbw = raw.readBytesAsInteger(2);
    this.header.fmbh = raw.readBytesAsInteger(2);

    console.log("fmbh: " + this.header.fmbh);

    // picture w/h and offset in pixels
    this.header.picw = raw.readBytesAsInteger(3);
    this.header.pich = raw.readBytesAsInteger(3);
    this.header.picx = raw.readBytesAsInteger(1);
    this.header.picy = raw.readBytesAsInteger(1);

    // frame rate numerator and denominator
    this.header.frn = raw.readBytesAsInteger(4);
    if (this.header.frn <= 0) {
        throw new Error("Frn is " + this.header.frn);
    }
    this.header.frd = raw.readBytesAsInteger(4);

    // pixel aspect ratio numerator + denominator
    this.header.parn = raw.readBytesAsInteger(3);
    this.header.pard = raw.readBytesAsInteger(3);

    // here's where it maybe gets screwy

    // colorspace
    this.header.cs = raw.readBytesAsInteger(1);

    // bitrate in bits/s
    this.header.nombr = raw.readBytesAsInteger(3);

    // quality hint
    this.header.qual = raw.readBitsAsInteger(6,false);

    // amount to shift keyframe by in the granule position
    this.header.kfgshift = raw.readBitsAsInteger(5);

    // pixelformat
    this.header.pf = raw.readBitsAsInteger(2);

    // reserved
    this.header.res = raw.readBitsAsInteger(3);

    if (this.header.res !== 0) {
        throw new Error("Reserved === " + this.header.res);
    }

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

OGVHeaderDecoder.ilog = function (x) {

    var i = 0;
    while (x) {
        x = x >> 1;
        i++;
    }

    return i;
};