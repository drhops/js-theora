/*
* RawData - a container for data, to be read in terms of bytes or bits
* input:
*   data - usually the raw data as a String
*/
var RawData = function (data) {
	this.data = data;
	this.bitIndex = 0;
};

// converts next numBytes into a string if RawData is currently
// at a byte start point
// errors otherwise
RawData.prototype.readAsString = function (numBytes) {
	if (this.bitIndex % 8 !== 0) {
		throw new Error("Sorry, not supported yet");
	}
	
	var start = this.bitIndex/8;
	var out = this.data.slice(start, start + numBytes);
	this.bitIndex += 8*numBytes;
	
	return out;
};


/*
* RawData.prototype.readBits 
* input: 
*   numBits - number of bits you want read
* output:
*   variable containing the bits read
*
*
*/

RawData.prototype.readBits = function (numBits) {
	var output = "";
    var i;
    var outByte;
	for (i=0; i < numBits; i++) {
	    // create indicies for bits and bytes
		var byteIndex = Math.floor(this.bitIndex / 8);
		var bitOffset = 7 - (this.bitIndex % 8);
		
		if (byteIndex >= this.data.length) {
			throw new Error("Read past EOF");
		}
	    // load byte

        // get byte the ith bit is in 01010011|11010010|11010010
        // bit we want                            ^
        // curByte = 11010010
		var currByte = this.data.charCodeAt(byteIndex) & 0xFF;

        // bit offset is 4
	    // extract bit
        // (1<< bitOffset))
        // = "10000"
        // (currByte & (1 << bitOffset)) -> "10000" & "11010010"
        // = "10000"
        // (currByte & (1 << bitOffset)) >> bitOffset
        // = "1"

		var currBit  = (currByte & (1 << bitOffset)) >> bitOffset;
	    // add bit to output
        // shift outByte over by 1 and add bit
		outByte = outByte << 1;
		outByte = outByte | currBit;
        if(i % 8 == 7)
        {
            output += String.fromCharCode(outByte);
            outByte="";
        }
		this.bitIndex++;
	}
    // last index looked at wasn't a 7 ... i.e. whe havent filled out an entire byte yet
    if((i-1) % 8 != 7)
    {
        // fill the outByte with 0s to left
        outByte = outByte << 8- i%8;
        output += String.fromCharCode(outByte);
        outByte = "";
    }

	return output;
};

RawData.prototype.readByteAsInteger = function (signed)
{
    return this.readBytesAsInteger(1,signed);
};

RawData.prototype.readBytesAsInteger = function (numBytes,signed)
{
    return this.readBitsAsInteger(numBytes*8,signed);
};
/**
 * Hacky yet seeminly only way to read ints into signed or unsigned values given hat numBits can be > 32
 * @param numBits
 * @param signed
 */
RawData.prototype.readBitsAsInteger = function (numBits,signed) {

    var out = "";
    var i;
    for (i=0; i < numBits; i++) {
        // create indicies for bits and bytes
        var byteIndex = Math.floor(this.bitIndex / 8);
        var bitOffset = 7 - (this.bitIndex % 8);

        if (byteIndex >= this.data.length) {
            throw new Error("Read past EOF");
        }
        // load byte
        var currByte = this.data.charCodeAt(byteIndex) & 0xFF;
        // extract bit
        var currBit  = (currByte & (1 << bitOffset)) >> bitOffset;
        // add bit to output
        out += currBit.toString(2);

        this.bitIndex++;
    }

    if(signed)
    {
        return -parseInt(out.substr(0,1),2)*Math.pow(2,out.length-1)+parseInt(out.substr(1),2)
    }else
    {
        return parseInt(out,2);
    }

};

RawData.prototype.skipBytes = function (numBytes) {
	this.bitIndex += (numBytes *8);
};

RawData.prototype.readByte = function () {
	return this.readBytes(1);
};

RawData.prototype.getBitIndex = function () {
	return this.bitIndex;
};

RawData.prototype.readBytes = function (numBytes) {

	if (this.bitIndex % 8 === 0) {
	    // if we are at a byte boundy, just read bytes into out
		var out = "";

		if (this.bitIndex/8 >= this.data.length) {
			throw new Error("Read past EOF");
		}
        out = this.data.substr(Math.floor(this.bitIndex/8),numBytes);

        this.bitIndex+=8*numBytes;
        return out;


	}
    else
    {
    // otherwise read the bits
	return this.readBits(8*numBytes);
    }
};

_.bindAll(RawData);
