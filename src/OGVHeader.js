/**
 * Created with JetBrains WebStorm.
 * User: blakec
 * Date: 5/10/13
 * Time: 3:17 PM
 * To change this template use File | Settings | File Templates.
 */

OGVHeader = function()
{
    // page header;
    this.version;
    this.headerType;
    this.granulePos;
    this.serialNum;
    this.pageSeqNum;
    this.crc;
    this.numberPageSegments;
    this.segmentSizes=[];
    this.pageSize;


    // setup header
    this.acscale=[];
    this.dcscale=[];
    this.nbms;
    this.bms=[];
    this.nqrs=[]
    this.qrsizes=[];
    this.qrbmis=[];
    this.hts=[];
    this.lflims=[];

    // comment header
    this.vendor;
    this.ncomments;
    this.comments=[];

    // id header

    this.vmaj;
    this.vmin;
    this.vrev;
    this.fmbw;
    this.fmbh;
    this.nsbs;
    this.nmbs;
    this.picw;
    this.pich;
    this.picx;
    this.picy;
    this.frn;
    this.prd;
    this.parn;
    this.pard;
    this.cs;
    this.pf;
    this.nombr;
    this.qual;
    this.kfgshift;
    this.display_height;
    this.display_witdh;



};

OGVHeader.prototype.getBMSAt = function(i,j)
{
    return this.bms[i*this.nbms+j];
};

OGVHeader.prototype.setBMSAt = function(i,j,v)
{
    this.bms[i*this.nbms+j]=v;
};

OGVHeader.prototype.getNQRSAt = function(i,j)
{
    return this.nqrs[i*3+j];
};

OGVHeader.prototype.setNQRSAt = function(i,j,v)
{
    this.nqrs[i*3+j] =v;
};
OGVHeader.prototype.getQrSizesAt = function(i,j,k)
{
    return this.qrsizes[((i * 3) + j) * 63 + k];
};

OGVHeader.prototype.setQrSizesAt = function(i,j,k,v)
{
    this.qrsizes[((i * 3) + j) * 63 + k]=v;
};

OGVHeader.prototype.getQrBMISAt = function(i,j,k)
{
    return this.qrsizes[((i * 3) + j) * 64 + k];
};

OGVHeader.prototype.setQrBMISAt = function(i,j,k,v)
{
    this.qrsizes[((i * 3) + j) * 64 + k]=v;
};

OGVHeader.prototype.getHTSAt = function(i,j)
{
    return this.hts[i*32,+j];
};

OGVHeader.prototype.setHTSAt = function(i,j,v)
{
    this.hts[i*32,+j]=v;
};