package ;
import haxe.Int64;
import js.Node;
import xlsx.XlsxData;

/**
 * ...
 * @author Scott Lee
 */
enum TypeEnum {
	TByte(byte:Int);
	TShort(short:Int);
	TInt(int:Int);
	TLong(long:Int64);
	TFloat(float:Float);
	TString(str:String, len:Int);
	TBytes(bytes:ByteArray, from:Int, len:Int);
}
class ByteArray
{
	var data:Array<TypeEnum>;
    var pos:Int;
    var len:Int;
	var endian:Bool;
	
	public function new(?bigEndian:Bool = true) 
	{
		pos = 0;
		len = 0;
		endian = bigEndian;
		data = new Array<TypeEnum>();
	}
	
	public function writeByte(byte:Int):Void
	{
        data.push(TByte(byte));
        len += 1;
    }
	
    public function writeShort(byte:Int):Void
	{
        data.push(TShort(byte));
        len += 2;
    }
	
    public function writeInt(byte:Int):Void
	{
        data.push(TInt(byte));
        len += 4;
    }
	
    public function writeInt64(byte:Int64):Void
	{
        data.push(TLong(byte));
        len += 8;
    }
	
    public function writeFloat(byte:Float):Void
	{
        data.push(TFloat(byte));
        len += 8;
    }
	
    public function writeString(str:String, strLen:Int):Void
	{
        data.push(TString(str, strLen));
        len += strLen;
    }
	
	public function toBuffer():NodeBuffer
	{
        var buf:NodeBuffer = new NodeBuffer(len);
		pos = 0;
		for (node in data) 
		{
			switch (node) 
			{
				case TByte(byte):
					buf.writeUInt8(byte, pos);
					pos += 1;
				case TShort(short):
					if(endian) buf.writeUInt16BE(short, pos);
					else buf.writeUInt16LE(short, pos);
					pos += 2;
				case TInt(int):
					if(endian) buf.writeUInt32BE(int, pos);
					else buf.writeUInt32LE(int, pos);
					pos += 4;
				case TLong(long):
					if (endian)
					{
						buf.writeUInt32BE(Int64.getHigh(long), pos);
						buf.writeUInt32BE(Int64.getLow(long), pos + 4);
					} else
					{
						buf.writeUInt32LE(Int64.getLow(long), pos);
						buf.writeUInt32LE(Int64.getHigh(long), pos + 4);
					}
					pos += 8;
				case TFloat(float):
					if(endian) buf.writeFloatBE(float, pos);
					else buf.writeFloatLE(float, pos);
					pos += 8;
				case TString(str, len):
					buf.write(str, pos, len, 'utf8');
					pos += len;
				case TBytes(bytes, from, len):
					pos += len;
			}
		}
		return buf;
    }
	
	public function writeItem(item:ItemNode, str:String):Void 
	{
		switch (item.type) 
		{
			case "byte":
				var val = 0;
				if (str != null) val = Std.parseInt(str);
				writeByte(val);
			case "short":
				var val = 0;
				if (str != null) val = Std.parseInt(str);
				writeShort(val);
			case "int":
				var val = 0;
				if (str != null) val = Std.parseInt(str);
				writeInt(val);
			case "string":
				var val = "";
				if (str != null) val = str;
				var len = new NodeBuffer(str).length;
				writeShort(len);
				writeString(val, len);
			default:
				
		}
	}
}