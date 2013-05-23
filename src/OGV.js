var OGV = function () {
    this.raw = null;
    this.state = OGV.NOT_LOADED;
};

OGV.prototype.download = function (url, cb, jq) {
    this.state = OGV.DOWNLOADING;

    if (!jq) {
    jq = $;
    }

    var obj = this;

    jq.ajax({
    url: url,
    beforeSend: function ( xhr ) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    }).done(function ( data ) {
    obj.dataDownloaded(data);
    cb();
    });
};

OGV.prototype.dataDownloaded = function (data) {
    this.raw = new RawData(data);

};


OGV.prototype.readNextPage = function () {
    var headerDecoder = new OGVHeaderDecoder();
    var header = headerDecoder.decodeHeader(this.raw);
    return header;

};









OGV.NOT_LOADED = 1;
OGV.DOWNLOADING = 2;

_.bindAll(OGV);
