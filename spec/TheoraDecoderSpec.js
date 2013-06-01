describe("TheoraDecoder ", function () {

    var sToRaw = function (sData) {
        var sOut = "";

        for (var i=0; i < sData.length; i+=2) {
            var sByte = sData[i] + sData[i+1];
            sOut += String.fromCharCode(parseInt(sByte, 16));
        }

        return sOut;
    };

    var readBlob = function(url,raw) {
        var xhr = new XMLHttpRequest();  // Create new XHR object
        xhr.open("GET", url);            // Specify URL to fetch
        //var data;
        var reader = new FileReader();
        xhr.responseType = "blob";        // We'd like a Blob, please
        xhr.onload = function() {        // onload is easier than onreadystatechange
            var blob= xhr.response;      // Pass the blob to our callback

            reader.onloadend = function(file)
            {
                raw.data = file.target.result;

            };
            reader.readAsBinaryString(blob);
        };                                // Note .response, not .responseText
        xhr.send(null);                  // Send the request now
    };



    it("barfs on bad theora codec", function () {

        var raw = {};

        readBlob("http://0.0.0.0:8000/data/bad_header_test.th",raw);

        var waitFn = function()
        {
            return raw.data != undefined;
        };
        waitsFor(waitFn, "Blob data never loaded",10000);

        runs(function() {
            var data =new RawData(raw.data);
            var thd = new TheoraHeaderDecoder();
            var raised = false;
            try
            {
            thd.decodeCommentHeader(data);
            }
            catch (e)
            {
                raised = true;
            }

            expect(raised).toEqual(true);

        });
    });

    it("parses an id header", function () {
        var raw = {};

        readBlob("http://0.0.0.0:8000/data/id_header_test.th",raw);

        var waitFn = function()
        {
            return raw.data != undefined;
        };
        waitsFor(waitFn, "Blob data never loaded",10000);

        runs(function() {
            var data =new RawData(raw.data);
            var thd = new TheoraHeaderDecoder();
            thd.decodeIdHeader(data);

            var header = thd.header;


            expect(header.display_width).toEqual(320);
            expect(header.display_height).toEqual(240);

        });

    });

    it("parses a comments header", function () {
        var raw = {};

        readBlob("http://0.0.0.0:8000/data/comment_header_test.th",raw);

        var waitFn = function()
        {
            return raw.data != undefined;
        };
        waitsFor(waitFn, "Blob data never loaded",10000);

        runs(function() {
            var data =new RawData(raw.data);
            var thd = new TheoraHeaderDecoder();
            thd.decodeCommentHeader(data);

            var header = thd.header;

            expect(header.vendor).toEqual("Xiph.Org libTheora I 20040317 3 2 0");
            expect(header.comments.length).toEqual(0);

        });

    });

    it("parses a setup header", function () {
        var raw = {};

        readBlob("http://0.0.0.0:8000/data/setup_header_test.th",raw);

        var waitFn = function()
        {
            return raw.data != undefined;
        };
        waitsFor(waitFn, "Blob data never loaded",10000);

        runs(function() {
            var data =new RawData(raw.data);
            var thd = new TheoraHeaderDecoder();
            thd.decodeSetupHeader(data);

            var header = thd.header;

            expect(header.lflims.length).toEqual(64);

        });

    });

    it("parses all three headers properly", function () {
        var raw = {};

        readBlob("http://0.0.0.0:8000/data/read_header_test.th",raw);

        var waitFn = function()
        {
            return raw.data != undefined;
        };
        waitsFor(waitFn, "Blob data never loaded",10000);

        runs(function() {
            var data =new RawData(raw.data);
            var thd = new TheoraHeaderDecoder();
            thd.decodePacket(data);
            thd.decodePacket(data);
            thd.decodePacket(data);

            var header = thd.header;

        });

    });

    it("does ilog properly", function () {

        expect(TheoraUtils.ilog(0)).toEqual(0);
        expect(TheoraUtils.ilog(1)).toEqual(1);
        expect(TheoraUtils.ilog(2)).toEqual(2);
        expect(TheoraUtils.ilog(3)).toEqual(2);
        expect(TheoraUtils.ilog(10)).toEqual(4);
    });

});
