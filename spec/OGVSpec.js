describe("OGV loader", function () {
	
	var sToRaw = function (sData) {
		var sOut = "";
		
		for (var i=0; i < sData.length; i+=2) {
			var sByte = sData[i] + sData[i+1];
			sOut += String.fromCharCode(parseInt(sByte, 16));
		}
		
		return sOut;
	};

    var full_data;
    function getBlob(url) {
        var xhr = new XMLHttpRequest();  // Create new XHR object
        xhr.open("GET", url);            // Specify URL to fetch
        xhr.responseType = "blob";        // We'd like a Blob, please
        xhr.onload = function() {        // onload is easier than onreadystatechange
            var blob= xhr.response;      // Pass the blob to our callback
            var reader = new FileReader();
            reader.onloadend = function(file)
            {
                full_data = file.target.result;
            }
            full_data = reader.readAsBinaryString(blob);
        };                                // Note .response, not .responseText
        xhr.send(null);                  // Send the request now
    }

    getBlob("http://0.0.0.0:8000/data/smalltest.ogg");
    it("test data reading", function () {

    /*    // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Great success! All the File APIs are supported.
        } else {
            throw new Error('The File APIs are not fully supported in this browser.');
        }

        var reader = new FileReader();
        var ogv = new OGV();
        var file = new File();

        reader.onload = function(event) {
            var data = event.target.result;
            ogv.dataDownloaded(data);
        };

        reader.onerror = function(event) {
            console.error("File could not be read! Code " + event.target.error.code);
        };
        reader.readAsText();

        expect(true).toEqual(true);
     */
    });
	
	it("barfs on bad codec", function () {
		var data = sToRaw("4F67675300020000000000000000BB2CA23B0000000045A89A7F012A807469666F7261030201002800170002800001680008000000190000000100000100");
		var ogv = new OGV("");

		var raised = false;
		try {
			ogv.dataDownloaded(data);
			ogv.readNextPage();
		} catch (e) {
			raised = true;
		}

		expect(raised).toEqual(true);
	});
	
	it("parses an id header", function () {
		var data = sToRaw("4F67675300020000000000000000BB2CA23B0000000045A89A7F012A807468656F72610302010028001700028000016800080000001900000001000001000001000000007CD81");
		
		/*
		 * 		var url = "fart.com/poop";
		 * 
		var fake$ = { ajax: function (x) { return; }};
		spyOn(fake$, "ajax").andReturn({
			done: function (cb) {
				cb(data);
			}
		});
		
		var callback = jasmine.createSpy();
		
		var ogv = new OGV(url, fake$);
		ogv.download(url, callback, fake$);
		
		expect(fake$.ajax).toHaveBeenCalled();
		expect(callback).toHaveBeenCalled();
		*/
		
		var ogv = new OGV();
		ogv.dataDownloaded(data);
		
		var header = ogv.readNextPage();
		
		expect(header.segmentSizes.length).toEqual(1);
		

		expect(header.display_width).toEqual(640);
		expect(header.display_height).toEqual(368);
		
		try {
			ogv.raw.readBit(1);
		} catch (e) {
			return;
		}
		expect(0).toEqual(1);
	});
	
	it("reads comment headers and multiple segments properly", function () {
		var data = sToRaw("4F67675300000000000000000000BB2CA23B010000007EEF52300E35FFFFFFFFFFFFFFFFFFFFFFFF90817468656F72610D0000004C61766635342E36312E3130300100000015000000656E636F6465723D4C61766635342E36312E313030827468656F7261BECD28F7B9CD6B18B5A9494A10739CE6318C5294A42108318C621084210840000000000000000000116DAE536792C8FC5612FC78395B6CE62AF568AB54281329245A10FE79399B8D66530978B255299389248219087C3C1D8E06A34180BC562A1409046221087C3C1C0C8602C1408838");
		var ogv = new OGV();
		ogv.dataDownloaded(data);
        var ogv_hd = new OGVHeaderDecoder();
        ogv_hd.decodePageHeader(ogv.raw);

        var header = ogv_hd.header;

		expect(header.segmentSizes.length).toEqual(2);

        ogv_hd.readSegment(ogv.raw);
		
		expect(header.vendor).toEqual("Lavf54.61.100");
		expect(header.comments.length).toEqual(1);
		expect(header.comments[0]).toEqual("encoder=Lavf54.61.100");
	});
	
	it("reads a setup header", function () {
		var data = sToRaw("827468656F7261BECD28F7B9CD6B18B5A9494A10739CE6318C5294A42108318C621084210840000000000000000000116DAE536792C8FC5612FC78395B6CE62AF568AB54281329245A10FE79399B8D66530978B255299389248219087C3C1D8E06A34180BC562A1409046221087C3C1C0C8602C14088381516DAE536792C8FC5612FC78395B6CE62AF568AB54281329245A10FE79399B8D66530978B255299389248219087C3C1D8E06A34180BC562A1409046221087C3C1C0C8602C1408838140B0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0C0C0F121414150D0D0E11121515140E0E0F12141515150E101113141515151011141515151515121314151515151514151515151515151515151515151515100C0B1014191B1C0D0D0E12151C1C1B0E0D1014191C1C1C0E1013161B1D1D1C1113191C1C1E1E1D14181B1C1D1E1E1D1B1C1D1D1E1E1E1E1D1D1D1D1E1E1E1D100B0A101828333D0C0C0E131A3A3C370E0D1018283945380E11161D3357503E1216253A446D674D182337405168715C31404E5767797865485C5F627064676313131313131313131313131313131313131313131313131313131313131313131313131313131313131313131313131313131313131313131313131313131313121215191A1A1A1A1214161A1A1A1A1A1516191A1A1A1A1A191A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1112161F24242424121418222424242416182124242424241F2224242424242424242424242424242424242424242424242424242424242424242424242424241112182F6363636312151A4263636363181A3863636363632F42636363636363636363636363636363636363636363636363636363636363636363636363636315151515151515151515151515151515151515151515151515151515151515151515151515151515151515151515151515151515151515151515151515151515121212151718191B1212151718191B1C12151718191B1C1D151718191B1C1D1D1718191B1C1D1D1D18191B1C1D1D1D1E191B1C1D1D1D1E1E1B1C1D1D1D1E1E1E11111114171A1C20111114171A1C20221114171A1C20222514171A1C20222525171A1C20222525251A1C2022252525291C2022252525292A2022252525292A2A10101014181C2028101014181C2028301014181C2028304014181C2028304040181C2028304040401C202830404040602028304040406080283040404060808007C5E5C747D5EDCEC3F2FAEB01A66");
		
		var ogv = new OGV();
		ogv.dataDownloaded(data);
        var ogv_hd = new OGVHeaderDecoder();
        ogv_hd.readSegment(ogv.raw);
        var header = ogv_hd.header;

		expect(header.lflims.length).toEqual(64);
		
		console.log(JSON.stringify(seg, null, "\t"));
	});
	
	it("does ilog properly", function () {

		expect(OGVHeaderDecoder.ilog(0)).toEqual(0);
		expect(OGVHeaderDecoder.ilog(1)).toEqual(1);
		expect(OGVHeaderDecoder.ilog(2)).toEqual(2);
		expect(OGVHeaderDecoder.ilog(3)).toEqual(2);
		expect(OGVHeaderDecoder.ilog(10)).toEqual(4);
	});
	
	it("rejects bad headers", function () {
		var data = sToRaw("4F672253");

		var ogv = new OGV();
		ogv.dataDownloaded(data);
		
		try {
			ogv.readNextPage();
		} catch (e) {
			return;
		}
		expect("did not throw error").toEqual(false);
	});
});
