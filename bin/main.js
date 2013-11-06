(function () { "use strict";
var $estr = function() { return js.Boot.__string_rec(this,''); };
var TypeEnum = { __ename__ : true, __constructs__ : ["TByte","TShort","TInt","TLong","TFloat","TString","TBytes"] }
TypeEnum.TByte = function($byte) { var $x = ["TByte",0,$byte]; $x.__enum__ = TypeEnum; $x.toString = $estr; return $x; }
TypeEnum.TShort = function($short) { var $x = ["TShort",1,$short]; $x.__enum__ = TypeEnum; $x.toString = $estr; return $x; }
TypeEnum.TInt = function($int) { var $x = ["TInt",2,$int]; $x.__enum__ = TypeEnum; $x.toString = $estr; return $x; }
TypeEnum.TLong = function($long) { var $x = ["TLong",3,$long]; $x.__enum__ = TypeEnum; $x.toString = $estr; return $x; }
TypeEnum.TFloat = function($float) { var $x = ["TFloat",4,$float]; $x.__enum__ = TypeEnum; $x.toString = $estr; return $x; }
TypeEnum.TString = function(str,len) { var $x = ["TString",5,str,len]; $x.__enum__ = TypeEnum; $x.toString = $estr; return $x; }
TypeEnum.TBytes = function(bytes,from,len) { var $x = ["TBytes",6,bytes,from,len]; $x.__enum__ = TypeEnum; $x.toString = $estr; return $x; }
var ByteArray = function(bigEndian) {
	if(bigEndian == null) bigEndian = true;
	this.pos = 0;
	this.len = 0;
	this.endian = bigEndian;
	this.data = new Array();
};
ByteArray.__name__ = true;
ByteArray.prototype = {
	writeItem: function(item,str) {
		switch(item.type) {
		case "byte":
			var val = 0;
			if(str != null) val = Std.parseInt(str);
			this.writeByte(val);
			break;
		case "short":
			var val = 0;
			if(str != null) val = Std.parseInt(str);
			this.writeShort(val);
			break;
		case "int":
			var val = 0;
			if(str != null) val = Std.parseInt(str);
			this.writeInt(val);
			break;
		case "string":
			var val = "";
			if(str != null) val = str;
			var len = new Buffer(str).length;
			this.writeShort(len);
			this.writeString(val,len);
			break;
		default:
		}
	}
	,toBuffer: function() {
		var buf = new Buffer(this.len);
		this.pos = 0;
		var _g = 0, _g1 = this.data;
		while(_g < _g1.length) {
			var node = _g1[_g];
			++_g;
			var $e = (node);
			switch( $e[1] ) {
			case 0:
				var $byte = $e[2];
				buf.writeUInt8($byte,this.pos);
				this.pos += 1;
				break;
			case 1:
				var $short = $e[2];
				if(this.endian) buf.writeUInt16BE($short,this.pos); else buf.writeUInt16LE($short,this.pos);
				this.pos += 2;
				break;
			case 2:
				var $int = $e[2];
				if(this.endian) buf.writeUInt32BE($int,this.pos); else buf.writeUInt32LE($int,this.pos);
				this.pos += 4;
				break;
			case 3:
				var $long = $e[2];
				if(this.endian) {
					buf.writeUInt32BE(haxe.Int64.getHigh($long),this.pos);
					buf.writeUInt32BE(haxe.Int64.getLow($long),this.pos + 4);
				} else {
					buf.writeUInt32LE(haxe.Int64.getLow($long),this.pos);
					buf.writeUInt32LE(haxe.Int64.getHigh($long),this.pos + 4);
				}
				this.pos += 8;
				break;
			case 4:
				var $float = $e[2];
				if(this.endian) buf.writeFloatBE($float,this.pos); else buf.writeFloatLE($float,this.pos);
				this.pos += 8;
				break;
			case 5:
				var len = $e[3], str = $e[2];
				buf.write(str,this.pos,len,"utf8");
				this.pos += len;
				break;
			case 6:
				var len = $e[4], from = $e[3], bytes = $e[2];
				this.pos += len;
				break;
			}
		}
		return buf;
	}
	,writeString: function(str,strLen) {
		this.data.push(TypeEnum.TString(str,strLen));
		this.len += strLen;
	}
	,writeFloat: function($byte) {
		this.data.push(TypeEnum.TFloat($byte));
		this.len += 8;
	}
	,writeInt64: function($byte) {
		this.data.push(TypeEnum.TLong($byte));
		this.len += 8;
	}
	,writeInt: function($byte) {
		this.data.push(TypeEnum.TInt($byte));
		this.len += 4;
	}
	,writeShort: function($byte) {
		this.data.push(TypeEnum.TShort($byte));
		this.len += 2;
	}
	,writeByte: function($byte) {
		this.data.push(TypeEnum.TByte($byte));
		this.len += 1;
	}
	,__class__: ByteArray
}
var CodeGenerator = function() { }
CodeGenerator.__name__ = true;
CodeGenerator.creatAs = function(itemList,codePath,info) {
	if(CodeGenerator["as"] == null) CodeGenerator["as"] = Std.string(js.Node.require("fs").readFileSync("templete/as.templete")).split("||");
	var clsName = codePath.substring(codePath.lastIndexOf("/") + 1,codePath.length);
	var str = StringTools.replace(CodeGenerator["as"][0],"$clsName",clsName);
	str = StringTools.replace(str,"$info",info);
	var props = new Array();
	var reads = new Array();
	var _g = 0;
	while(_g < itemList.length) {
		var item = itemList[_g];
		++_g;
		var propStr = StringTools.replace(CodeGenerator["as"][1],"$info",item.name);
		propStr = StringTools.replace(propStr,"$prop",item.code);
		propStr = StringTools.replace(propStr,"$type",CodeGenerator.getAsType(item.type));
		props.push(propStr);
		propStr = StringTools.replace(CodeGenerator["as"][2],"$prop",item.code);
		propStr = StringTools.replace(propStr,"$read",CodeGenerator.getAsRead(item));
		reads.push(propStr);
	}
	str = StringTools.replace(str,"$prop",props.join(""));
	str = StringTools.replace(str,"$reader",reads.join("\n"));
	js.Node.require("fs").writeFileSync(codePath + ".as",str);
}
CodeGenerator.getAsType = function(str) {
	switch(str) {
	case "string":
		return "String";
	default:
		return "int";
	}
}
CodeGenerator.getAsRead = function(item) {
	switch(item.type) {
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
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	matched: function(n) {
		return this.r.m != null && n >= 0 && n < this.r.m.length?this.r.m[n]:(function($this) {
			var $r;
			throw "EReg::matched";
			return $r;
		}(this));
	}
	,match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,__class__: EReg
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
}
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,__class__: List
}
var Main = function() { }
Main.__name__ = true;
Main.main = function() {
	Main.cellReg = new EReg("([A-Za-z]+)([0-9]+)","");
	Main.pageFieldHash = new haxe.ds.StringMap();
	Main.xlsxHash = new haxe.ds.StringMap();
	Main.XLSX = js.Node.require("xlsx");
	var xml = new haxe.xml.Fast(Xml.parse(Std.string(js.Node.require("fs").readFileSync("hero.xml"))).firstElement());
	var $it0 = xml.nodes.resolve("node").iterator();
	while( $it0.hasNext() ) {
		var node = $it0.next();
		if(!Main.parseNode(node)) {
			Main.log("[error!]" + Main.errStr);
			return;
		}
	}
	Main.log("parse success!");
}
Main.parseNode = function(xml) {
	if(!xml.has.resolve("xlsx")) {
		Main.errStr = "xml 配置中没有xlsx";
		return false;
	}
	if(!xml.has.resolve("page")) {
		Main.errStr = "xml 配置中没有page";
		return false;
	}
	if(!xml.has.resolve("out")) {
		Main.errStr = "xml 配置中没有out";
		return false;
	}
	var xlsxPath = xml.att.resolve("xlsx");
	var outPath = xml.att.resolve("out");
	var pagePath = xml.att.resolve("page");
	var pagePath1 = xml.att.resolve("page");
	var codePath = null;
	if(xml.has.resolve("code")) codePath = xml.att.resolve("code");
	if(!js.Node.require("fs").existsSync(xlsxPath)) {
		Main.errStr = xlsxPath + "表不存在";
		return false;
	}
	var itemList = new Array();
	var $it0 = xml.nodes.resolve("item").iterator();
	while( $it0.hasNext() ) {
		var item = $it0.next();
		itemList.push(Main.parseItem(item));
	}
	var xlsx = Main.getXlsx(xlsxPath);
	var sheets = xlsx.Sheets;
	if(!Reflect.hasField(sheets,pagePath1)) {
		Main.errStr = xlsxPath + " 表中不存在页码 " + pagePath1;
		return false;
	}
	var page = Reflect.field(sheets,pagePath1);
	var _g = 0, _g1 = Reflect.fields(page);
	while(_g < _g1.length) {
		var z = _g1[_g];
		++_g;
		var row = Main.getRow(z);
		if(z.charAt(0) == "!" || row.row > 1) break;
		var cell = Reflect.field(page,z);
		var _g2 = 0;
		while(_g2 < itemList.length) {
			var item = itemList[_g2];
			++_g2;
			if(item.name == cell.v) {
				item.row = row;
				break;
			}
		}
	}
	var _g = 0;
	while(_g < itemList.length) {
		var item = itemList[_g];
		++_g;
		if(item.row == null) {
			Main.errStr = "列:" + item.name + " 在表" + pagePath1 + "中不存在";
			return false;
		}
	}
	var out = new ByteArray();
	var rowPos = 2;
	var cellStr = null;
	var cellKey = "";
	while(true) {
		if(!Reflect.hasField(page,itemList[0].row.col + rowPos)) break;
		var _g = 0;
		while(_g < itemList.length) {
			var item = itemList[_g];
			++_g;
			cellKey = item.row.col + rowPos;
			if(Reflect.hasField(page,cellKey)) {
				cellStr = Reflect.field(page,cellKey).v;
				if(item.replace != null && item.replace.length > 3) cellStr = Main.replaceItem(item,cellStr);
			} else cellStr = null;
			out.writeItem(item,cellStr);
		}
		rowPos++;
	}
	js.Node.require("fs").writeFileSync(outPath,out.toBuffer());
	if(codePath != null) CodeGenerator.creatAs(itemList,codePath,xlsxPath + " - " + pagePath1);
	return true;
}
Main.replaceItem = function(item,str) {
	var xlsx = Main.getXlsx(item.replace[0]);
	var page = Reflect.field(xlsx.Sheets,item.replace[1]);
	var fieldHash = Main.getPageField(page,item.replace);
	var colKey = "";
	if(item.replace.length == 5) colKey = item.replace[4]; else {
		colKey = item.replace[3];
		var _g = 0, _g1 = Reflect.fields(page);
		while(_g < _g1.length) {
			var z = _g1[_g];
			++_g;
			var row = Main.getRow(z);
			if(z.charAt(0) == "!" || row.row > 1) break;
			var cell = Reflect.field(page,z);
			if(colKey == cell.v) {
				colKey = row.col;
				break;
			}
		}
		item.replace.push(colKey);
	}
	if(fieldHash.exists(str)) return Reflect.field(page,colKey + fieldHash.get(str)).v;
	return str;
}
Main.getPageField = function(page,path) {
	var pathKey = path[0] + "|" + path[1] + "|" + path[2];
	if(Main.pageFieldHash.exists(pathKey)) return Main.pageFieldHash.get(pathKey);
	var fieldHash = new haxe.ds.StringMap();
	var colKey = path[2];
	var _g = 0, _g1 = Reflect.fields(page);
	while(_g < _g1.length) {
		var z = _g1[_g];
		++_g;
		var row = Main.getRow(z);
		if(z.charAt(0) == "!" || row.row > 1) break;
		var cell = Reflect.field(page,z);
		if(colKey == cell.v) {
			colKey = row.col;
			break;
		}
	}
	if(colKey == path[2]) return null;
	var rowPos = 2;
	var cell = null;
	while(true) {
		if(!Reflect.hasField(page,colKey + rowPos)) break;
		cell = Reflect.field(page,colKey + rowPos);
		fieldHash.set(cell.v,rowPos);
		rowPos++;
	}
	Main.pageFieldHash.set(pathKey,fieldHash);
	return fieldHash;
}
Main.getRow = function(str) {
	Main.cellReg.match(str);
	return { col : Main.cellReg.matched(1), row : Std.parseInt(Main.cellReg.matched(2))};
}
Main.getXlsx = function(path) {
	if(Main.xlsxHash.exists(path)) return Main.xlsxHash.get(path);
	var t = new Date().getTime();
	var xlsx = Main.XLSX.readFile(path);
	Main.xlsxHash.set(path,xlsx);
	Main.log("parse " + path + " cost:" + (new Date().getTime() - t));
	return xlsx;
}
Main.parseItem = function(xml) {
	var replace = null;
	var gap = null;
	if(xml.has.resolve("replace")) replace = xml.att.resolve("replace").split("|");
	if(xml.has.resolve("gap")) gap = xml.att.resolve("gap");
	return { type : xml.att.resolve("type"), name : xml.att.resolve("name"), code : xml.att.resolve("code"), row : null, replace : replace, gap : gap};
}
Main.log = function(Str) {
	js.Node.console.log(Std.string(Str));
}
var IMap = function() { }
IMap.__name__ = true;
var Reflect = function() { }
Reflect.__name__ = true;
Reflect.hasField = function(o,field) {
	return Object.prototype.hasOwnProperty.call(o,field);
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
	}
	return v;
}
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
}
var Std = function() { }
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	addSub: function(s,pos,len) {
		this.b += len == null?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len);
	}
	,__class__: StringBuf
}
var StringTools = function() { }
StringTools.__name__ = true;
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
var Sys = function() { }
Sys.__name__ = true;
Sys.args = function() {
	return js.Node.process.argv;
}
Sys.getEnv = function(key) {
	return Reflect.field(js.Node.process.env,key);
}
Sys.environment = function() {
	return js.Node.process.env;
}
Sys.exit = function(code) {
	js.Node.process.exit(code);
}
Sys.time = function() {
	return new Date().getTime() / 1000;
}
var XmlType = { __ename__ : true, __constructs__ : [] }
var Xml = function() {
};
Xml.__name__ = true;
Xml.parse = function(str) {
	return haxe.xml.Parser.parse(str);
}
Xml.createElement = function(name) {
	var r = new Xml();
	r.nodeType = Xml.Element;
	r._children = new Array();
	r._attributes = new haxe.ds.StringMap();
	r.set_nodeName(name);
	return r;
}
Xml.createPCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.PCData;
	r.set_nodeValue(data);
	return r;
}
Xml.createCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.CData;
	r.set_nodeValue(data);
	return r;
}
Xml.createComment = function(data) {
	var r = new Xml();
	r.nodeType = Xml.Comment;
	r.set_nodeValue(data);
	return r;
}
Xml.createDocType = function(data) {
	var r = new Xml();
	r.nodeType = Xml.DocType;
	r.set_nodeValue(data);
	return r;
}
Xml.createProcessingInstruction = function(data) {
	var r = new Xml();
	r.nodeType = Xml.ProcessingInstruction;
	r.set_nodeValue(data);
	return r;
}
Xml.createDocument = function() {
	var r = new Xml();
	r.nodeType = Xml.Document;
	r._children = new Array();
	return r;
}
Xml.prototype = {
	addChild: function(x) {
		if(this._children == null) throw "bad nodetype";
		if(x._parent != null) HxOverrides.remove(x._parent._children,x);
		x._parent = this;
		this._children.push(x);
	}
	,firstElement: function() {
		if(this._children == null) throw "bad nodetype";
		var cur = 0;
		var l = this._children.length;
		while(cur < l) {
			var n = this._children[cur];
			if(n.nodeType == Xml.Element) return n;
			cur++;
		}
		return null;
	}
	,elementsNamed: function(name) {
		if(this._children == null) throw "bad nodetype";
		return { cur : 0, x : this._children, hasNext : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				var n = this.x[k];
				if(n.nodeType == Xml.Element && n._nodeName == name) break;
				k++;
			}
			this.cur = k;
			return k < l;
		}, next : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				var n = this.x[k];
				k++;
				if(n.nodeType == Xml.Element && n._nodeName == name) {
					this.cur = k;
					return n;
				}
			}
			return null;
		}};
	}
	,exists: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.exists(att);
	}
	,set: function(att,value) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		this._attributes.set(att,value);
	}
	,get: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.get(att);
	}
	,set_nodeValue: function(v) {
		if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
		return this._nodeValue = v;
	}
	,set_nodeName: function(n) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName = n;
	}
	,get_nodeName: function() {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName;
	}
	,__class__: Xml
}
var haxe = {}
haxe.Int64 = function() { }
haxe.Int64.__name__ = true;
haxe.Int64.getLow = function(x) {
	return x.low;
}
haxe.Int64.getHigh = function(x) {
	return x.high;
}
haxe.Int64.prototype = {
	__class__: haxe.Int64
}
haxe.Timer = function(time_ms) {
	var me = this, fn = function() {
		Reflect.field(me,"run").apply(me,[]);
	};
	this.id = haxe.Timer.arr.length;
	haxe.Timer.arr[this.id] = this;
	this.timerId = js.Node.setInterval(fn,time_ms,[]);
};
haxe.Timer.__name__ = true;
haxe.Timer.delay = function(f,time_ms) {
	var t = new haxe.Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
}
haxe.Timer.stamp = function() {
	return Sys.time();
}
haxe.Timer.prototype = {
	run: function() {
	}
	,stop: function() {
		if(this.id == null) return;
		js.Node.clearInterval(this.timerId);
		haxe.Timer.arr[this.id] = null;
		if(this.id > 100 && this.id == haxe.Timer.arr.length - 1) {
			var p = this.id - 1;
			while(p >= 0 && haxe.Timer.arr[p] == null) p--;
			haxe.Timer.arr = haxe.Timer.arr.slice(0,p + 1);
		}
		this.id = null;
	}
	,__class__: haxe.Timer
}
haxe.ds = {}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: haxe.ds.StringMap
}
haxe.io = {}
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
haxe.io.Bytes.__name__ = true;
haxe.io.Bytes.alloc = function(length) {
	return new haxe.io.Bytes(length,new Buffer(length));
}
haxe.io.Bytes.ofString = function(s) {
	var nb = new Buffer(s,"utf8");
	return new haxe.io.Bytes(nb.length,nb);
}
haxe.io.Bytes.ofData = function(b) {
	return new haxe.io.Bytes(b.length,b);
}
haxe.io.Bytes.prototype = {
	getData: function() {
		return this.b;
	}
	,toHex: function() {
		var s = new StringBuf();
		var chars = [];
		var str = "0123456789abcdef";
		var _g1 = 0, _g = str.length;
		while(_g1 < _g) {
			var i = _g1++;
			chars.push(HxOverrides.cca(str,i));
		}
		var _g1 = 0, _g = this.length;
		while(_g1 < _g) {
			var i = _g1++;
			var c = this.b[i];
			s.b += String.fromCharCode(chars[c >> 4]);
			s.b += String.fromCharCode(chars[c & 15]);
		}
		return s.b;
	}
	,toString: function() {
		return this.readString(0,this.length);
	}
	,readString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c2 = b[i++];
				var c3 = b[i++];
				s += fcc((c & 15) << 18 | (c2 & 127) << 12 | c3 << 6 & 127 | b[i++] & 127);
			}
		}
		return s;
	}
	,compare: function(other) {
		var b1 = this.b;
		var b2 = other.b;
		var len = this.length < other.length?this.length:other.length;
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			if(b1[i] != b2[i]) return b1[i] - b2[i];
		}
		return this.length - other.length;
	}
	,sub: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var nb = new Buffer(len), slice = this.b.slice(pos,pos + len);
		slice.copy(nb,0,0,len);
		return new haxe.io.Bytes(len,nb);
	}
	,blit: function(pos,src,srcpos,len) {
		if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw haxe.io.Error.OutsideBounds;
		src.b.copy(this.b,pos,srcpos,srcpos + len);
	}
	,set: function(pos,v) {
		this.b[pos] = v;
	}
	,get: function(pos) {
		return this.b[pos];
	}
	,__class__: haxe.io.Bytes
}
haxe.io.BytesBuffer = function() {
	this.b = new Array();
};
haxe.io.BytesBuffer.__name__ = true;
haxe.io.BytesBuffer.prototype = {
	getBytes: function() {
		var nb = new Buffer(this.b);
		var bytes = new haxe.io.Bytes(nb.length,nb);
		this.b = null;
		return bytes;
	}
	,addBytes: function(src,pos,len) {
		if(pos < 0 || len < 0 || pos + len > src.length) throw haxe.io.Error.OutsideBounds;
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = pos, _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,add: function(src) {
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = 0, _g = src.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,addByte: function($byte) {
		this.b.push($byte);
	}
	,__class__: haxe.io.BytesBuffer
}
haxe.io.Eof = function() { }
haxe.io.Eof.__name__ = true;
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
}
haxe.io.Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] }
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; }
haxe.xml = {}
haxe.xml._Fast = {}
haxe.xml._Fast.NodeAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.NodeAccess.__name__ = true;
haxe.xml._Fast.NodeAccess.prototype = {
	__class__: haxe.xml._Fast.NodeAccess
}
haxe.xml._Fast.AttribAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.AttribAccess.__name__ = true;
haxe.xml._Fast.AttribAccess.prototype = {
	resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		var v = this.__x.get(name);
		if(v == null) throw this.__x.get_nodeName() + " is missing attribute " + name;
		return v;
	}
	,__class__: haxe.xml._Fast.AttribAccess
}
haxe.xml._Fast.HasAttribAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.HasAttribAccess.__name__ = true;
haxe.xml._Fast.HasAttribAccess.prototype = {
	resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		return this.__x.exists(name);
	}
	,__class__: haxe.xml._Fast.HasAttribAccess
}
haxe.xml._Fast.HasNodeAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.HasNodeAccess.__name__ = true;
haxe.xml._Fast.HasNodeAccess.prototype = {
	__class__: haxe.xml._Fast.HasNodeAccess
}
haxe.xml._Fast.NodeListAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.NodeListAccess.__name__ = true;
haxe.xml._Fast.NodeListAccess.prototype = {
	resolve: function(name) {
		var l = new List();
		var $it0 = this.__x.elementsNamed(name);
		while( $it0.hasNext() ) {
			var x = $it0.next();
			l.add(new haxe.xml.Fast(x));
		}
		return l;
	}
	,__class__: haxe.xml._Fast.NodeListAccess
}
haxe.xml.Fast = function(x) {
	if(x.nodeType != Xml.Document && x.nodeType != Xml.Element) throw "Invalid nodeType " + Std.string(x.nodeType);
	this.x = x;
	this.node = new haxe.xml._Fast.NodeAccess(x);
	this.nodes = new haxe.xml._Fast.NodeListAccess(x);
	this.att = new haxe.xml._Fast.AttribAccess(x);
	this.has = new haxe.xml._Fast.HasAttribAccess(x);
	this.hasNode = new haxe.xml._Fast.HasNodeAccess(x);
};
haxe.xml.Fast.__name__ = true;
haxe.xml.Fast.prototype = {
	__class__: haxe.xml.Fast
}
haxe.xml.Parser = function() { }
haxe.xml.Parser.__name__ = true;
haxe.xml.Parser.parse = function(str) {
	var doc = Xml.createDocument();
	haxe.xml.Parser.doParse(str,0,doc);
	return doc;
}
haxe.xml.Parser.doParse = function(str,p,parent) {
	if(p == null) p = 0;
	var xml = null;
	var state = 1;
	var next = 1;
	var aname = null;
	var start = 0;
	var nsubs = 0;
	var nbrackets = 0;
	var c = str.charCodeAt(p);
	var buf = new StringBuf();
	while(!(c != c)) {
		switch(state) {
		case 0:
			switch(c) {
			case 10:case 13:case 9:case 32:
				break;
			default:
				state = next;
				continue;
			}
			break;
		case 1:
			switch(c) {
			case 60:
				state = 0;
				next = 2;
				break;
			default:
				start = p;
				state = 13;
				continue;
			}
			break;
		case 13:
			if(c == 60) {
				var child = Xml.createPCData(buf.b + HxOverrides.substr(str,start,p - start));
				buf = new StringBuf();
				parent.addChild(child);
				nsubs++;
				state = 0;
				next = 2;
			} else if(c == 38) {
				buf.addSub(str,start,p - start);
				state = 18;
				next = 13;
				start = p + 1;
			}
			break;
		case 17:
			if(c == 93 && str.charCodeAt(p + 1) == 93 && str.charCodeAt(p + 2) == 62) {
				var child = Xml.createCData(HxOverrides.substr(str,start,p - start));
				parent.addChild(child);
				nsubs++;
				p += 2;
				state = 1;
			}
			break;
		case 2:
			switch(c) {
			case 33:
				if(str.charCodeAt(p + 1) == 91) {
					p += 2;
					if(HxOverrides.substr(str,p,6).toUpperCase() != "CDATA[") throw "Expected <![CDATA[";
					p += 5;
					state = 17;
					start = p + 1;
				} else if(str.charCodeAt(p + 1) == 68 || str.charCodeAt(p + 1) == 100) {
					if(HxOverrides.substr(str,p + 2,6).toUpperCase() != "OCTYPE") throw "Expected <!DOCTYPE";
					p += 8;
					state = 16;
					start = p + 1;
				} else if(str.charCodeAt(p + 1) != 45 || str.charCodeAt(p + 2) != 45) throw "Expected <!--"; else {
					p += 2;
					state = 15;
					start = p + 1;
				}
				break;
			case 63:
				state = 14;
				start = p;
				break;
			case 47:
				if(parent == null) throw "Expected node name";
				start = p + 1;
				state = 0;
				next = 10;
				break;
			default:
				state = 3;
				start = p;
				continue;
			}
			break;
		case 3:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				if(p == start) throw "Expected node name";
				xml = Xml.createElement(HxOverrides.substr(str,start,p - start));
				parent.addChild(xml);
				state = 0;
				next = 4;
				continue;
			}
			break;
		case 4:
			switch(c) {
			case 47:
				state = 11;
				nsubs++;
				break;
			case 62:
				state = 9;
				nsubs++;
				break;
			default:
				state = 5;
				start = p;
				continue;
			}
			break;
		case 5:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				var tmp;
				if(start == p) throw "Expected attribute name";
				tmp = HxOverrides.substr(str,start,p - start);
				aname = tmp;
				if(xml.exists(aname)) throw "Duplicate attribute";
				state = 0;
				next = 6;
				continue;
			}
			break;
		case 6:
			switch(c) {
			case 61:
				state = 0;
				next = 7;
				break;
			default:
				throw "Expected =";
			}
			break;
		case 7:
			switch(c) {
			case 34:case 39:
				state = 8;
				start = p;
				break;
			default:
				throw "Expected \"";
			}
			break;
		case 8:
			if(c == str.charCodeAt(start)) {
				var val = HxOverrides.substr(str,start + 1,p - start - 1);
				xml.set(aname,val);
				state = 0;
				next = 4;
			}
			break;
		case 9:
			p = haxe.xml.Parser.doParse(str,p,xml);
			start = p;
			state = 1;
			break;
		case 11:
			switch(c) {
			case 62:
				state = 1;
				break;
			default:
				throw "Expected >";
			}
			break;
		case 12:
			switch(c) {
			case 62:
				if(nsubs == 0) parent.addChild(Xml.createPCData(""));
				return p;
			default:
				throw "Expected >";
			}
			break;
		case 10:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				if(start == p) throw "Expected node name";
				var v = HxOverrides.substr(str,start,p - start);
				if(v != parent.get_nodeName()) throw "Expected </" + parent.get_nodeName() + ">";
				state = 0;
				next = 12;
				continue;
			}
			break;
		case 15:
			if(c == 45 && str.charCodeAt(p + 1) == 45 && str.charCodeAt(p + 2) == 62) {
				parent.addChild(Xml.createComment(HxOverrides.substr(str,start,p - start)));
				p += 2;
				state = 1;
			}
			break;
		case 16:
			if(c == 91) nbrackets++; else if(c == 93) nbrackets--; else if(c == 62 && nbrackets == 0) {
				parent.addChild(Xml.createDocType(HxOverrides.substr(str,start,p - start)));
				state = 1;
			}
			break;
		case 14:
			if(c == 63 && str.charCodeAt(p + 1) == 62) {
				p++;
				var str1 = HxOverrides.substr(str,start + 1,p - start - 2);
				parent.addChild(Xml.createProcessingInstruction(str1));
				state = 1;
			}
			break;
		case 18:
			if(c == 59) {
				var s = HxOverrides.substr(str,start,p - start);
				if(s.charCodeAt(0) == 35) {
					var i = s.charCodeAt(1) == 120?Std.parseInt("0" + HxOverrides.substr(s,1,s.length - 1)):Std.parseInt(HxOverrides.substr(s,1,s.length - 1));
					buf.b += Std.string(String.fromCharCode(i));
				} else if(!haxe.xml.Parser.escapes.exists(s)) buf.b += Std.string("&" + s + ";"); else buf.b += Std.string(haxe.xml.Parser.escapes.get(s));
				start = p + 1;
				state = next;
			}
			break;
		}
		c = str.charCodeAt(++p);
	}
	if(state == 1) {
		start = p;
		state = 13;
	}
	if(state == 13) {
		if(p != start || nsubs == 0) parent.addChild(Xml.createPCData(buf.b + HxOverrides.substr(str,start,p - start)));
		return p;
	}
	throw "Unexpected end";
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) {
					if(cl == Array) return o.__enum__ == null;
					return true;
				}
				if(js.Boot.__interfLoop(o.__class__,cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
}
js.NodeC = function() { }
js.NodeC.__name__ = true;
js.Node = function() { }
js.Node.__name__ = true;
js.Node.get_assert = function() {
	return js.Node.require("assert");
}
js.Node.get_child_process = function() {
	return js.Node.require("child_process");
}
js.Node.get_cluster = function() {
	return js.Node.require("cluster");
}
js.Node.get_crypto = function() {
	return js.Node.require("crypto");
}
js.Node.get_dgram = function() {
	return js.Node.require("dgram");
}
js.Node.get_dns = function() {
	return js.Node.require("dns");
}
js.Node.get_fs = function() {
	return js.Node.require("fs");
}
js.Node.get_http = function() {
	return js.Node.require("http");
}
js.Node.get_https = function() {
	return js.Node.require("https");
}
js.Node.get_net = function() {
	return js.Node.require("net");
}
js.Node.get_os = function() {
	return js.Node.require("os");
}
js.Node.get_path = function() {
	return js.Node.require("path");
}
js.Node.get_querystring = function() {
	return js.Node.require("querystring");
}
js.Node.get_repl = function() {
	return js.Node.require("repl");
}
js.Node.get_tls = function() {
	return js.Node.require("tls");
}
js.Node.get_url = function() {
	return js.Node.require("url");
}
js.Node.get_util = function() {
	return js.Node.require("util");
}
js.Node.get_vm = function() {
	return js.Node.require("vm");
}
js.Node.get___filename = function() {
	return __filename;
}
js.Node.get___dirname = function() {
	return __dirname;
}
js.Node.get_json = function() {
	return JSON;
}
js.Node.newSocket = function(options) {
	return new js.Node.net.Socket(options);
}
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
Xml.Element = "element";
Xml.PCData = "pcdata";
Xml.CData = "cdata";
Xml.Comment = "comment";
Xml.DocType = "doctype";
Xml.ProcessingInstruction = "processingInstruction";
Xml.Document = "document";
js.Node.setTimeout = setTimeout;
js.Node.clearTimeout = clearTimeout;
js.Node.setInterval = setInterval;
js.Node.clearInterval = clearInterval;
js.Node.global = global;
js.Node.process = process;
js.Node.require = require;
js.Node.console = console;
js.Node.module = module;
js.Node.stringify = JSON.stringify;
js.Node.parse = JSON.parse;
var version = HxOverrides.substr(js.Node.process.version,1,null).split(".").map(Std.parseInt);
if(version[0] > 0 || version[1] >= 9) {
	js.Node.setImmediate = setImmediate;
	js.Node.clearImmediate = clearImmediate;
}
haxe.Timer.arr = new Array();
haxe.xml.Parser.escapes = (function($this) {
	var $r;
	var h = new haxe.ds.StringMap();
	h.set("lt","<");
	h.set("gt",">");
	h.set("amp","&");
	h.set("quot","\"");
	h.set("apos","'");
	h.set("nbsp",String.fromCharCode(160));
	$r = h;
	return $r;
}(this));
js.NodeC.UTF8 = "utf8";
js.NodeC.ASCII = "ascii";
js.NodeC.BINARY = "binary";
js.NodeC.BASE64 = "base64";
js.NodeC.HEX = "hex";
js.NodeC.EVENT_EVENTEMITTER_NEWLISTENER = "newListener";
js.NodeC.EVENT_EVENTEMITTER_ERROR = "error";
js.NodeC.EVENT_STREAM_DATA = "data";
js.NodeC.EVENT_STREAM_END = "end";
js.NodeC.EVENT_STREAM_ERROR = "error";
js.NodeC.EVENT_STREAM_CLOSE = "close";
js.NodeC.EVENT_STREAM_DRAIN = "drain";
js.NodeC.EVENT_STREAM_CONNECT = "connect";
js.NodeC.EVENT_STREAM_SECURE = "secure";
js.NodeC.EVENT_STREAM_TIMEOUT = "timeout";
js.NodeC.EVENT_STREAM_PIPE = "pipe";
js.NodeC.EVENT_PROCESS_EXIT = "exit";
js.NodeC.EVENT_PROCESS_UNCAUGHTEXCEPTION = "uncaughtException";
js.NodeC.EVENT_PROCESS_SIGINT = "SIGINT";
js.NodeC.EVENT_PROCESS_SIGUSR1 = "SIGUSR1";
js.NodeC.EVENT_CHILDPROCESS_EXIT = "exit";
js.NodeC.EVENT_HTTPSERVER_REQUEST = "request";
js.NodeC.EVENT_HTTPSERVER_CONNECTION = "connection";
js.NodeC.EVENT_HTTPSERVER_CLOSE = "close";
js.NodeC.EVENT_HTTPSERVER_UPGRADE = "upgrade";
js.NodeC.EVENT_HTTPSERVER_CLIENTERROR = "clientError";
js.NodeC.EVENT_HTTPSERVERREQUEST_DATA = "data";
js.NodeC.EVENT_HTTPSERVERREQUEST_END = "end";
js.NodeC.EVENT_CLIENTREQUEST_RESPONSE = "response";
js.NodeC.EVENT_CLIENTRESPONSE_DATA = "data";
js.NodeC.EVENT_CLIENTRESPONSE_END = "end";
js.NodeC.EVENT_NETSERVER_CONNECTION = "connection";
js.NodeC.EVENT_NETSERVER_CLOSE = "close";
js.NodeC.FILE_READ = "r";
js.NodeC.FILE_READ_APPEND = "r+";
js.NodeC.FILE_WRITE = "w";
js.NodeC.FILE_WRITE_APPEND = "a+";
js.NodeC.FILE_READWRITE = "a";
js.NodeC.FILE_READWRITE_APPEND = "a+";
Main.main();
})();
