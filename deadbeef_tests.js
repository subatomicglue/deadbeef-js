#!/usr/bin/env node

let deadbeef = require( "./src/deadbeef.js" );

function unit_tests() {
  console.assert( deadbeef.dechex( 0 ) == 0, "error: dechex" );
  console.assert( deadbeef.str_pad( deadbeef.dechex( 0 ), 2, "00", "STR_PAD_LEFT" ).length == 2, "error: str_pad1" ); 
  console.assert( deadbeef.str_pad( deadbeef.dechex( 1 ), 2, "00", "STR_PAD_LEFT" ).length == 2, "error: str_pad2" ); 
  console.assert( deadbeef.str_pad( deadbeef.dechex( 69 ), 2, "00", "STR_PAD_LEFT" ).length == 2, "error: str_pad3" ); 
  console.assert( deadbeef.str_pad( deadbeef.dechex( 100 ), 2, "00", "STR_PAD_LEFT" ).length == 2, "error: str_pad4" ); 

  console.assert( deadbeef.detectOffsetOverride( "<c>kevin</c>", 6, 80 ) == 37, "error: detectOffsetOverride1" );
  console.assert( deadbeef.detectOffsetOverride( "<l>kevin</c>", 6, 80 ) == 6, "error: detectOffsetOverride2" );
  console.assert( deadbeef.detectOffsetOverride( "<r>kevin</r>", 6, 80 ) == 69, "error: detectOffsetOverride3" );
  console.assert( deadbeef.detectOffsetOverride( "<l pos=4>left indented 4</l>", 6, 80 ) == 4, "error: detectOffsetOverride4" );
}
unit_tests();


function manual_test() {
  $page_text = ` 

  <c><b>centered</b></c> 

  <r>right    </r> 
  some text 
  some text   is good to have
  some text is nice to read 
  <l pos=32>left indented 32</l>
  <l pos=30>left indented 30</l>
  <a href="dead link">dead link</a> - some dead link that doesn't work

  <l pos=4>left indented 4</l>

  `;

  deadbeef.gen_html = true;
  deadbeef.$deadbeef_linkcolor = "#0090ff";
  deadbeef.$deadbeef_alinkcolor = "#0090ff";
  deadbeef.$deadbeef_vlinkcolor = "#0090ff";
  deadbeef.$deadbeef_textcolor = "#ffffff";
  deadbeef.$deadbeef_bgcolor = "#010101";
  deadbeef.$deadbeef_tonemap = [ [60,20,0], [100,100,0], [150,0,150], [20, 60, 60] ];
  deadbeef.$deadbeef_title = "subatomicglue - secret projects";

  // final
  console.log( deadbeef.DrawPage( $page_text, 6, 80, 13 ) );
}
manual_test();

