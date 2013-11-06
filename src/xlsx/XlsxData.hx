package xlsx;

/**
 * ...
 * @author Scott Lee
 */
typedef Row = {
	col:String,
	row:Int
}

typedef ItemNode = {
	type:String,
	name:String,
	code:String,
	row:Row,
	replace:Array<String>,
	gap:String
}