    function bin2String(binstr) {
        while(binstr.length%8 != 0)
        {
            binstr+="0"
        }
        var result = "";
        for (var i = 0; i < Math.ceil(binstr.length/8); i++) {

            result += String.fromCharCode(parseInt(binstr.substr(i*8,8) ,2));
        }
        return result;
    }

    function compareCharOut(out,bin)
    {

        while(bin.length%8 != 0)
        {
            bin += "0";
        }

        if(out.length != bin.length/8)
        {
            return false;
        }

        var i;
        var c,bc;
        for(i=0;i<out.length;i++)
        {

            c=out.charCodeAt(i);
            bc = parseInt(bin.substr(i*8,8),2);

            if(bc != c)
            {
                return false;
            }
        }
        return true;
    }

describe("Raw Reader", function () {

	it("reads strings", function () {
        var data = String.fromCharCode(parseInt("11110000",2))+"ASDF" + String.fromCharCode(parseInt("10101011",2));
		
		var r = new RawData(data);

        expect(compareCharOut(r.readByte(),"11110000")).toEqual(true);
        		expect(r.readAsString(4)).toEqual("ASDF");
        expect(compareCharOut(r.readByte(),"10101011")).toEqual(true);

	});
	
	it("reads individual bits", function () {
		var data = "" + String.fromCharCode(0xF0);

		var r = new RawData(data);

		for (var i=0; i < 8; i++) {
			var bit = r.readBits(1);
            expect(compareCharOut(bit,i < 4?"1":"0")).toEqual(true);
		}
	});

    it("reads unsigned ints", function () {

        var binary =  [ "10110101010","011010","1110011101","01100010010000100010001011110111101111100011111010101000101001001010001"];
        var i, r, b,data;

        for (i=0; i <binary.length; i++) {
            b = binary[i];
            data = bin2String(b +"001001000100");
            r = new RawData(data);
            var number= r.readBitsAsInteger(b.length,false);
            expect(number).toEqual(parseInt(b,2));
        }
    });

    it("reads signed ints", function () {

        var binary =  [ "111","111111111111","000000000","01111110","10000000","10000001","10000010","00100100101000001111110110111010101111011110101111101110111011110000"];
        var answers =[-1,-1,0,126,-128,-127,-126,42230213762099370000];
        var i, r, b,data;

        for (i=0; i < binary.length; i++) {
            b = binary[i];
            data = bin2String(b +"001001000100");
            r = new RawData(data);
            var number= r.readBitsAsInteger(b.length,true);
            expect(number).toEqual(answers[i]);
        }
    });

	it("reads bits across multiple bytes", function () {
        var data = String.fromCharCode(parseInt("11110000",2)) + String.fromCharCode(parseInt("00001110",2));


		var r = new RawData(data);
        var i,bit;
		for (i=0; i < 8; i++) {
			bit = r.readBits(1);
            expect(compareCharOut(bit,i < 4?"1":"0")).toEqual(true);
		}

        bit = r.readBits(1);
        expect(compareCharOut(bit,"0")).toEqual(true);


		for (i=0; i < 6; i++) {
			bit = r.readBits(1);

            expect(compareCharOut(bit,i < 3 ? "0":"1")).toEqual(true);

		}

        bit = r.readBits(1);
        expect(compareCharOut(bit,"0")).toEqual(true);
			});
	
	it("can read multiple bytes at a time", function () {


        var data = String.fromCharCode(parseInt("11110000",2))
            + String.fromCharCode(parseInt("00001100",2))
            + String.fromCharCode(parseInt("10000011",2))
            + String.fromCharCode(parseInt("01010011",2))
            + String.fromCharCode(parseInt("01011101",2))
            + String.fromCharCode(parseInt("11111111",2))
            + String.fromCharCode(parseInt("10000000",2))
            + String.fromCharCode(parseInt("01001001",2))
            + String.fromCharCode(parseInt("01011101",2));


		var r = new RawData(data);
		
		var parsed = r.readBytes(8);

		expect(compareCharOut(parsed,"1111000000001100100000110101001101011101111111111000000001001001")).toEqual(true);
	});

	it("can mix bits and bytes", function () {

        var data = String.fromCharCode(parseInt("11110000",2))
            + String.fromCharCode(parseInt("00001100",2))
            + String.fromCharCode(parseInt("10000011",2));


		var r = new RawData(data);


        expect(compareCharOut(r.readByte(),"11110000")).toEqual(true);
        expect(compareCharOut(r.readBits(2),"00")).toEqual(true);
        expect(compareCharOut(r.readByte(),"00110010")).toEqual(true);


	});
	
	it("can skip bytes", function () {
        // 11110000 00001110 11111111
        var data = String.fromCharCode(parseInt("11110000",2))
            + String.fromCharCode(parseInt("00001100",2))
            + String.fromCharCode(parseInt("10000011",2));

		var r = new RawData(data);

        expect(compareCharOut(r.readByte(),"11110000")).toEqual(true);
        r.skipBytes(1);
        expect(compareCharOut(r.readByte(),"10000011")).toEqual(true);


	});
	
	it("reads bits in the right direction", function () {
        // "00000001"
        var data = String.fromCharCode(parseInt("00000001",2));

		
		var r = new RawData(data);

        expect(compareCharOut(r.readBits(2),"00")).toEqual(true);
        expect(compareCharOut(r.readBits(2),"00")).toEqual(true);
        expect(compareCharOut(r.readBits(4),"0001")).toEqual(true);

	});

	it("won't read past the end of the file", function () {

        var data = String.fromCharCode(parseInt("11110000",2))
            + String.fromCharCode(parseInt("00001100",2));


        var e;
		var r = new RawData(data);

		var didException = false;

		for (var i=0; i < 8; i++) {
			r.readBits(2);
		}

		try {
			r.readBits(1);
		} catch (e) {
			didException = true;
		}

		expect(didException).toEqual(true);
		
		didException = false;
		try {
			r.readByte();
		} catch (e) {
			didException = true;
		}
		expect(didException).toEqual(true);

	});
});