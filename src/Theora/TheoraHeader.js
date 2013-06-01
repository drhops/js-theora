/**
 * Created with JetBrains WebStorm.
 * User: blakec
 * Date: 5/31/13
 * Time: 2:48 PM
 * To change this template use File | Settings | File Templates.
 */
var TheoraHeader = function()
{
    // setup header
    this.acscale=[];
    this.dcscale=[];
    this.nbms=undefined;
    this.bms=[];
    this.nqrs=[];
    this.qrsizes=[];
    this.qrbmis=[];
    this.hts=[];
    this.lflims=[];

    // comment header
    this.vendor=undefined;
    this.ncomments=undefined;
    this.comments=[];

    // id header

    this.vmaj=undefined;
    this.vmin=undefined;
    this.vrev=undefined;
    this.fmbw=undefined;
    this.fmbh=undefined;
    this.nsbs=undefined;
    this.nmbs=undefined;
    this.picw=undefined;
    this.pich=undefined;
    this.picx=undefined;
    this.picy=undefined;
    this.frn=undefined;
    this.prd=undefined;
    this.parn=undefined;
    this.pard=undefined;
    this.cs=undefined;
    this.pf=undefined;
    this.nombr=undefined;
    this.qual=undefined;
    this.kfgshift=undefined;
    this.display_height=undefined;
    this.display_witdh=undefined;



};

TheoraHeader.prototype.getBMSAt = function(i,j)
{
    return this.bms[i*this.nbms+j];
};

TheoraHeader.prototype.setBMSAt = function(i,j,v)
{
    this.bms[i*this.nbms+j]=v;
};

TheoraHeader.prototype.getNQRSAt = function(i,j)
{
    return this.nqrs[i*3+j];
};

TheoraHeader.prototype.setNQRSAt = function(i,j,v)
{
    this.nqrs[i*3+j] =v;
};
TheoraHeader.prototype.getQrSizesAt = function(i,j,k)
{
    return this.qrsizes[((i * 3) + j) * 63 + k];
};

TheoraHeader.prototype.setQrSizesAt = function(i,j,k,v)
{
    this.qrsizes[((i * 3) + j) * 63 + k]=v;
};

TheoraHeader.prototype.getQrBMISAt = function(i,j,k)
{
    return this.qrsizes[((i * 3) + j) * 64 + k];
};

TheoraHeader.prototype.setQrBMISAt = function(i,j,k,v)
{
    this.qrsizes[((i * 3) + j) * 64 + k]=v;
};

TheoraHeader.prototype.getHTSAt = function(i,j)
{
    return this.hts[i*32+j];
};

TheoraHeader.prototype.setHTSAt = function(i,j,v)
{
    this.hts[i*32+j]=v;
};