/**
 * Created with JetBrains WebStorm.
 * User: blakec
 * Date: 5/30/13
 * Time: 2:23 PM
 * To change this template use File | Settings | File Templates.
 */
var OggDecoder = function()
{
    // should be a TheoraDecoder
    this.curPageHeader = undefined;
    this.curSegment = 0;
    this.pagesRead =0;
    this.packetsRead=0;

};



OggDecoder.prototype.hasAnotherPacket=function()
{
    if(this.curPageHeader)
    {
        var isLastPage = ((this.curPageHeader.headerType << 5) >> 7) == 1;
        var hasMoreSegments = this.curSegment < this.curPageHeader.numPageSegments;
        return !isLastPage || hasMoreSegments;
    }
    else
    {
        return true;
    }

};

/**
 * call this to extract the next packet in the ogg file
 * we only care about this function because we dont care about pages, only the packets.
 * pages are for the Ogg format to deal with slicing itself up, but as an outside user
 * we only care about the contents of the packets.
 *
 * Doing it this way allows the OggDecoder class to obfuscate the deals with packets that lie on Page borders.
 */
OggDecoder.prototype.extractNextPacket=function(raw)
{
    // we havent grabbed a page yet

    if(!this.curPageHeader)
    {
        this.curPageHeader = this.decodePageHeader(raw);
    }
    // or we've gone through all the segments in previous page
    else if(this.curSegment >= this.curPageHeader.numPageSegments)
    {
        this.curSegment = 0;
        this.curPageHeader = this.decodePageHeader(raw);
    }


    var packet = "";
    var packetComplete = false;

    while(!packetComplete)
    {
        // we havent completed the packet yet AND we've ended the page
        if(this.curSegment >= this.curPageHeader.numPageSegments)
        {
            this.curSegment=0;
            this.curPageHeader = this.decodePageHeader(raw);
        }

        // get the next segments size
        var segmentSize = this.curPageHeader.segmentSizes[this.curSegment];

        // if its < 255 this is a terminating segment
        if(segmentSize <255)
        {
            packetComplete = true;
        }
        var segment = raw.readBytes(segmentSize);

        packet += segment;
        this.curSegment++;
    }
    // packet has been formed, return this
    // ogg decoder has raw positioned to read next packet
    this.packetsRead++;
    return packet;
};

OggDecoder.prototype.stripOggFromData = function(raw)
{

};

OggDecoder.prototype.decodePageHeader = function (raw) {

    // http://en.wikipedia.org/wiki/Ogg_page

    // read OGG page
    // read ogg magic number from header "OggS"

    if (raw.readBytes(4) != "OggS")
    {
        throw new Error("OggS Magic doesn't match");
    }



    // ** read page version (8 bits) **
    // version of the Ogg format. should be 0 for now
    var version = raw.readByteAsInteger();

    if (version !== 0) {
        throw new Error("Version is " + version);
    }

    // ** read header type (8 bits) **

    // This is an 8 bit field of flags, which indicates the type of page that follows.
    // The rightmost or least significant bit is considered bit 0, with value 0x01,
    // the next least significant digit is bit 1, with value 0x02. The third is bit 2, with
    // value 0x04, and so on.

    var headerType = raw.readByteAsInteger();

    // ** read Granule Position (64 bits) **
    // A granule position is the time marker in Ogg files. It is an abstract value,
    // whose meaning is determined by the codec. It may for example be a count of the
    // number of samples, the number of frames or a more complex scheme.

    var granulePos = raw.readBytes(8);


    // ** read bitstream serial number (32 bits) **
    // This field is a serial number that identifies a page as belonging to a particular logical
    // bitstream. Each logical bitstream in a file has a unique value, and this field allows
    // implementations to deliver the pages to the appropriate decoder. In a typical Vorbis
    // and Theora file, one stream is the audio (Vorbis), and the other is the video (Theora)


    var serialNum  = raw.readBytesAsInteger(4);

    // ** read Page sequance number (32 bits) **
    // This field is a monotonically increasing field for each logical bitstream.
    //  The first page is 0, the second 1, etc. This allows implementations to detect when
    // data has been lost.

    var pageSeqNum = raw.readBytesAsInteger(4);

    // ** read checksum (32 bits) **
    // used to make sure data isnt corrupted

    var crc = raw.readBytesAsInteger(4);

    // ** read page segments (8 bits) **
    // This field indicates the number of segments that exist in this page.
    // It also indicates how many bytes are in the segment table that follows this field.
    // There can be a maximum of 255 segments in any one page.

    var numPageSegments = raw.readBytesAsInteger(1);

    var segmentSizes = [];
    var pageSize = 0;
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

    for (var i=0; i < numPageSegments; i++) {
        var segSize = raw.readByteAsInteger();
        pageSize += segSize;
        segmentSizes.push(segSize);
    }


    // TODO: use checksum to gauruntee stream correctness
    this.pagesRead++;
    return new OggPageHeader(version,headerType,granulePos,serialNum,pageSeqNum,crc,numPageSegments,segmentSizes,pageSize)
};



