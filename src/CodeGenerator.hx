package ;
import js.Node;
import xlsx.XlsxData.ItemNode;

/**
 * ...
 * @author Scott Lee
 */
class CodeGenerator
{
	static private var as:Array<String>;
	
	/**
	 * as3 的代码生成
	 */
	static public function creatAs(itemList:Array<ItemNode>, codePath:String, info:String):Void
	{
		if (as == null)
		{
			as = Std.string(Node.fs.readFileSync("templete/as.templete")).split("||");
		}
		
		var clsName = codePath.substring(codePath.lastIndexOf("/") + 1, codePath.length);
		
		var str = StringTools.replace(as[0], "$clsName", clsName);
		str = StringTools.replace(str, "$info", info);
		
		var props = new Array<String>();
		var reads = new Array<String>();
		for (item in itemList) 
		{
			var propStr = StringTools.replace(as[1], "$info", item.name);
			propStr = StringTools.replace(propStr, "$prop", item.code);
			propStr = StringTools.replace(propStr, "$type", getAsType(item.type));
			props.push(propStr);
			
			propStr = StringTools.replace(as[2], "$prop", item.code);
			propStr = StringTools.replace(propStr, "$read", getAsRead(item));
			reads.push(propStr);
		}
		str = StringTools.replace(str, "$prop", props.join(""));
		str = StringTools.replace(str, "$reader", reads.join("\n"));
		
		Node.fs.writeFileSync(codePath + ".as", str);
	}
	
	static private function getAsType(str:String):String
	{
		switch (str) 
		{
			case "string":
				return "String";
			default:
				return "int";
		}
	}
	
	static private function getAsRead(item:ItemNode):String
	{
		switch (item.type) 
		{
			case "byte":
				return "bytes.readUnsignedByte()";
			case "short":
				return "bytes.readUnsignedShort()";
			case "int":
				return "bytes.readInt()";
			case "string":
				return "bytes.readUTFBytes(bytes.readUnsignedShort())";
			default:
				return "";
		}
	}
}