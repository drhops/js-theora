/**
 * Created with JetBrains WebStorm.
 * User: blakec
 * Date: 5/31/13
 * Time: 2:51 PM
 * To change this template use File | Settings | File Templates.
 */

// Ogg-Theora Video Decoder

var OTVDecoder = function(bitstream)
{
    // every time a frame is decoded, listeners can grab it
    this.frameListners =[];
    this.raw = new RawData(bitstream);

};

OTVDecoder.prototype.decodeVideo = function()
{
    // ogg decoder
    var ogd = new OggDecoder();
    var idPacket = new RawData(ogd.extractNextPacket(this.raw));
    var commentPacket = new RawData(ogd.extractNextPacket(this.raw));
    var setupPacket = new RawData(ogd.extractNextPacket(this.raw));
    var thd = new TheoraHeaderDecoder();
    thd.decodePacket(idPacket);
    thd.decodePacket(commentPacket);
    thd.decodePacket(setupPacket);

    while(ogd.hasAnotherPacket())
    {
        var packet= ogd.extractNextPacket(this.raw);
        // use frame decoder to decode these packets
    }
};