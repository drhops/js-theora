/**
 * Created with JetBrains WebStorm.
 * User: blakec
 * Date: 5/30/13
 * Time: 6:36 PM
 * To change this template use File | Settings | File Templates.
 */
var OggPageHeader = function(version,headerType,granulePos,serialNum,pageSeqNum,crc,numPageSegments,segmentSizes,pageSize)

{
    this.version=version;
    this.headerType=headerType;
    this.granulePos=granulePos;
    this.serialNum=serialNum;
    this.pageSeqNum=pageSeqNum;
    this.crc=crc;
    this.numPageSegments= numPageSegments;
    this.segmentSizes=segmentSizes;
    this.pageSize=pageSize;
};
