describe("OggDecoder", function () {

    // test packets
    var PACKET_1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGH";
    var PACKET_2A= "";
    var PACKET_2B= "" ;
    var PACKET_3= ""   ;

    PACKET_2A+="F";
    for(var a=0;a<254;a++)
    {
        PACKET_2A+="O"
    }
    PACKET_2A+="B";
    for(var b=0;b<253;b++)
    {
        PACKET_2A+="A"
    }
    PACKET_2A+="R";

    for(var c=0;c<279;c++)
    {
        PACKET_2B+="#"
    }
    for(var d=0;d<1033;d++)
    {
        PACKET_3+="@"
    }
    // geneartes a fake Ogg Stream
    //
    var generateFakeOggStream = function()
    {
        var stream="";

        // page 1

        stream+= "OggS";
        // version
        stream+=  String.fromCharCode(0);
        //        header type
        stream+=  String.fromCharCode(parseInt("010",2));
        // 8 non-intelligent chars for granule pos
        stream+=  "12345678";
        // 4 bytes for serial num
        stream+=  "1234";
        // 4 bytes for page seq num
        stream+=  "1234";
        // 4 bytes for page checksum
        stream+=  "1234";
        // add byte representing that there are 7 segments
        stream += String.fromCharCode(3);
        // add segment sizes
        stream += String.fromCharCode(86);
        stream += String.fromCharCode(255);
        stream += String.fromCharCode(255);
        stream += PACKET_1;
        stream += PACKET_2A;


        // page 1

        stream+= "OggS";
        // version
        stream+=  String.fromCharCode(0);
        //        header type
        stream+=  String.fromCharCode(parseInt("101",2));
        // 8 non-intelligent chars for granule pos
        stream+=  "12345678";
        // 4 bytes for serial num
        stream+=  "1234";
        // 4 bytes for page seq num
        stream+=  "1234";
        // 4 bytes for page checksum
        stream+=  "1234";
        // add byte representing that there are 7 segments
        stream += String.fromCharCode(7);
        // add segment sizes
        stream += String.fromCharCode(255);
        stream += String.fromCharCode(24);
        stream += String.fromCharCode(255);
        stream += String.fromCharCode(255);
        stream += String.fromCharCode(255);
        stream += String.fromCharCode(255);
        stream += String.fromCharCode(13);
        stream += PACKET_2B;
        stream += PACKET_3;
        return stream;
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

    it("dies on a bad header", function () {

        var data =new RawData("FOOasdasdadsa342");

        var ogg = new OggDecoder();
        var error;
        try
        {
        var ogh = ogg.decodePageHeader(data);
        }
        catch (e)
        {
            error = e.message;
        }

        expect(error).toEqual("OggS Magic doesn't match");

    });

    it("decodes a page header", function () {

        var data =new RawData(generateFakeOggStream());

        var ogg = new OggDecoder();
        var ogh = ogg.decodePageHeader(data);

        expect(ogh.headerType).toEqual(parseInt("010",2));
        expect(ogh.segmentSizes.length).toEqual(3);
        expect(ogh.segmentSizes[0]).toEqual(86);
        expect(ogh.segmentSizes[1]).toEqual(255);
        expect(ogh.segmentSizes[2]).toEqual(255);


    });

    it("extracts a packet", function () {

        var data =new RawData(generateFakeOggStream());

        var ogg = new OggDecoder();
        var packet = ogg.extractNextPacket(data);


        expect(packet).toEqual(PACKET_1);
        expect(ogg.curSegment).toEqual(1);

    });

    it("extracts a cross page packet", function () {

        var data =new RawData(generateFakeOggStream());

        var ogg = new OggDecoder();
        var packet = ogg.extractNextPacket(data);


        expect(packet).toEqual(PACKET_1);
        expect(ogg.curSegment).toEqual(1);

        packet = ogg.extractNextPacket(data);


        expect(packet).toEqual(PACKET_2A+PACKET_2B);
        expect(ogg.curSegment).toEqual(2);

        packet = ogg.extractNextPacket(data);


        expect(packet).toEqual(PACKET_3);
        expect(ogg.curSegment).toEqual(7);

    });

    it("reads all packets and ends gracefully", function () {


        var raw = {};

        readBlob("http://0.0.0.0:8000/data/smalltest.ogg",raw);

        var waitFn = function()
        {
            return raw.data != undefined;
        };
        waitsFor(waitFn, "Blob data never loaded",10000);

        runs(function() {
            var data =new RawData(raw.data);

            var ogd = new OggDecoder();
            var error = "";
            while(ogd.hasAnotherPacket())
            {
                try
                {
                    var packet= ogd.extractNextPacket(data);
                }
                catch (e)
                {
                    error = e.message;
                    break;
                }
            }


            expect(error).toEqual("");
        });

    });



});
/**
 * Created with JetBrains WebStorm.
 * User: blakec
 * Date: 5/30/13
 * Time: 2:23 PM
 * To change this template use File | Settings | File Templates.
 */
