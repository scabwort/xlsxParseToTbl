package ;

import haxe.ds.StringMap;
import haxe.io.BytesOutput;
import haxe.Timer;
import haxe.xml.Fast;
import js.Lib;
import js.Node;
import xlsx.XlsxData;

/**
 * ...
 * @author Scott Lee
 */

class Main 
{
	static private var errStr:String;
	static private var XLSX:Dynamic;
	static private var xlsxHash:StringMap<Dynamic>;
	static private var cellReg:EReg;
	static private var pageFieldHash:StringMap<StringMap<Int>>;
	
	static function main() 
	{
		cellReg = ~/([A-Za-z]+)([0-9]+)/;
		
		pageFieldHash = new StringMap<StringMap<Int>>();
		xlsxHash = new StringMap<Dynamic>();
		XLSX = Node.require("xlsx");
		var xml:Fast = new Fast(Xml.parse(Std.string(Node.fs.readFileSync("hero.xml"))).firstElement());
		
		for (node in xml.nodes.node) 
		{
			if (!parseNode(node))
			{
				log("[error!]" + errStr);
				return;
			}
		}
		log("parse success!");
	}
	
	static function parseNode(xml:Fast):Bool
	{
		if (!xml.has.xlsx)
		{
			errStr = "xml 配置中没有xlsx";
			return false;
		}
		if (!xml.has.page)
		{
			errStr = "xml 配置中没有page";
			return false;
		}
		if (!xml.has.out)
		{
			errStr = "xml 配置中没有out";
			return false;
		}
		
		var xlsxPath = xml.att.xlsx;
		var outPath = xml.att.out;
		var pagePath = xml.att.page;
		var pagePath = xml.att.page;
		var codePath:String = null;
		if (xml.has.code) codePath = xml.att.code;
		
		if (!Node.fs.existsSync(xlsxPath))
		{
			errStr = xlsxPath + "表不存在";
			return false;
		}
		
		var itemList:Array<ItemNode> = new Array<ItemNode>();
		for (item in xml.nodes.item) 
		{
			itemList.push(parseItem(item));
		}
		
		//var t = Date.now().getTime();
		//解析xlsx
		var xlsx = getXlsx(xlsxPath);
		//log("parse xlsx cost:" + (Date.now().getTime() - t));
		//t = Date.now().getTime();
		var sheets = xlsx.Sheets;
		if (!Reflect.hasField(sheets, pagePath))
		{
			errStr = xlsxPath + " 表中不存在页码 " + pagePath;
			return false;
		}
		
		var page = Reflect.field(sheets, pagePath);
		
		//取出索引值
		for (z in Reflect.fields(page)) 
		{
			var row = getRow(z);
			if (z.charAt(0) == "!" || row.row > 1) break;
			//log(getRow(z));
			var cell = Reflect.field(page, z);
			for (item in itemList) 
			{
				if (item.name == cell.v)
				{
					item.row = row;
					break;
				}
			}
		}
		//检查是否全有
		for (item in itemList) 
		{
			if (item.row == null)
			{
				errStr = "列:" + item.name + " 在表" + pagePath + "中不存在";
				return false;
			}
		}
		//写入节点到二进制
		var out:ByteArray = new ByteArray();
		var rowPos = 2;
		var cellStr:String = null;
		var cellKey = "";
		while (true)
		{
			if (!Reflect.hasField(page, itemList[0].row.col + rowPos))
			{
				break;
			}
			for (item in itemList) 
			{
				cellKey = item.row.col + rowPos;
				if (Reflect.hasField(page, cellKey))
				{
					cellStr = Reflect.field(page, cellKey).v;
					//如果有替换规则
					if (item.replace != null && item.replace.length > 3)
					{
						cellStr = replaceItem(item, cellStr);
					}
				} else
				{
					cellStr = null;
				}
				out.writeItem(item, cellStr);
			}
			rowPos++;
		}
		Node.fs.writeFileSync(outPath, out.toBuffer());
		//log("parse table cost:" + (Date.now().getTime() - t));
		if (codePath != null)
			CodeGenerator.creatAs(itemList, codePath, xlsxPath + " - " + pagePath);
		
		return true;
	}
	
	static function replaceItem(item:ItemNode, str:String):Dynamic
	{
		var xlsx = getXlsx(item.replace[0]);
		var page = Reflect.field(xlsx.Sheets, item.replace[1]);
		
		var fieldHash:StringMap<Int> = getPageField(page, item.replace);
		//取出索引值
		var colKey:String = "";
		if (item.replace.length == 5)
		{
			colKey = item.replace[4];
		} else
		{
			colKey = item.replace[3];
			for (z in Reflect.fields(page)) 
			{
				var row = getRow(z);
				if (z.charAt(0) == "!" || row.row > 1) break;
				
				var cell = Reflect.field(page, z);
				if (colKey == cell.v)
				{
					colKey = row.col;
					break;
				}
			}
			item.replace.push(colKey);
		}
		
		if (fieldHash.exists(str))
		{
			return Reflect.field(page, colKey + fieldHash.get(str)).v;
		}
		
		return str;
	}
	/**
	 * 生成属性对应hash表，增加访问速度
	 */
	static function getPageField(page:Dynamic, path:Array<String>):StringMap<Int>
	{
		var pathKey:String = path[0] + "|" + path[1] + "|" + path[2];
		
		if (pageFieldHash.exists(pathKey))
		{
			return pageFieldHash.get(pathKey);
		}
		
		var fieldHash:StringMap<Int> = new StringMap<Int>();
		//取出索引值
		var colKey = path[2];
		for (z in Reflect.fields(page)) 
		{
			var row = getRow(z);
			if (z.charAt(0) == "!" || row.row > 1) break;
			
			var cell = Reflect.field(page, z);
			if (colKey == cell.v)
			{
				colKey = row.col;
				break;
			}
		}
		if (colKey == path[2]) return null;
		//缓存
		var rowPos = 2;
		var cell = null;
		while (true)
		{
			if (!Reflect.hasField(page, colKey + rowPos))
			{
				break;
			}
			cell = Reflect.field(page, colKey + rowPos);
			fieldHash.set(cell.v, rowPos);
			rowPos++;
		}
		pageFieldHash.set(pathKey, fieldHash);
		return fieldHash;
	}
	
	static function getRow(str:String):Row
	{
		cellReg.match(str);
		return {
			col:cellReg.matched(1),
			row:Std.parseInt(cellReg.matched(2))
			}
	}
	
	static function getXlsx(path:String):Dynamic
	{
		if (xlsxHash.exists(path))
		{
			return xlsxHash.get(path);
		}
		
		var t = Date.now().getTime();
		var xlsx = XLSX.readFile(path);
		xlsxHash.set(path, xlsx);
		log("parse " + path + " cost:" + (Date.now().getTime() - t));
		return xlsx;
	}
	
	static function parseItem(xml:Fast):ItemNode
	{
		var replace:Array<String> = null;
		var gap:String = null;
		if (xml.has.replace)
		{
			replace = xml.att.replace.split("|");
		}
		if (xml.has.gap)
		{
			gap = xml.att.gap;
		}
		return {
			type:xml.att.type,
			name:xml.att.name,
			code:xml.att.code,
			row:null,
			replace:replace,
			gap:gap,
			};
	}
	
	static function log(Str:Dynamic):Void
	{
		Node.console.log(Std.string(Str));
	}
}