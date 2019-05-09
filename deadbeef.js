/*
deadbeef - fancy pants webpage renderer
Copyright (c) 2006, 2019 kevin meinert all rights reserved

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
02110-1301  USA
*/

function deadbeef() {

  // these can be set to customize DrawPage
  this.linkcolor = "#0090ff";
  this.alinkcolor = "#0090ff";
  this.vlinkcolor = "#0090ff";
  this.textcolor = "#ffffff";
  this.bgcolor = "#010101";
  this.tonemap = [ [30,10,0], [40,40,0], [90,0,90], [10, 30, 30] ];
  this.title = "deadbeef";
  this.gen_html = false;
  this.elt = "font"; // div, span, font, etc...
  const VERBOSE = false;

  // return a number between a and b linearly interpolated by lerpval from [0..1]
  function lerp( $a, $b, $lerpval ) {
    return $a * (1 - $lerpval) + $b * $lerpval;
  }

  // clamp val to the range [lo..hi]
  function clamp( $val, $lo, $hi ) {
    return Math.max( $lo, Math.min( $val, $hi ) );
  }

  // porting from php
  // http://locutus.io/php/strings/str_pad/
  function str_pad (input, padLength, padString, padType) { // eslint-disable-line camelcase
    var half = ''
    var padToGo
    var _strPadRepeater = function (s, len) {
      var collect = ''
      while (collect.length < len) {
        collect += s
      }
      collect = collect.substr(0, len)
      return collect
    }
    input += ''
    padString = padString !== undefined ? padString : ' '
    if (padType !== 'STR_PAD_LEFT' && padType !== 'STR_PAD_RIGHT' && padType !== 'STR_PAD_BOTH') {
      padType = 'STR_PAD_RIGHT'
    }
    if ((padToGo = padLength - input.length) > 0) {
      if (padType === 'STR_PAD_LEFT') {
        input = _strPadRepeater(padString, padToGo) + input
      } else if (padType === 'STR_PAD_RIGHT') {
        input = input + _strPadRepeater(padString, padToGo)
      } else if (padType === 'STR_PAD_BOTH') {
        half = _strPadRepeater(padString, Math.ceil(padToGo / 2))
        input = half + input + half
        input = input.substr(0, padLength)
      }
    }
    return input
  }

  // porting from php
  // http://locutus.io/php/strings/dechex/
  function dechex (number) {
    if (number < 0) {
      number = 0xFFFFFFFF + number + 1
    }
    return parseInt(number, 10)
      .toString(16)
  }

  // porting from php
  // http://locutus.io/php/strings/substr_replace/
  function substr_replace (str, replace, start, length) {
    if (start < 0) {
      // start position in str
      start = start + str.length
    }
    length = length !== undefined ? length : str.length
    if (length < 0) {
      length = length + str.length - start
    }
    return [
      str.slice(0, start),
      replace.substr(0, length),
      replace.slice(length),
      str.slice(start + length)
    ].join('')
  }

  /// return RGB (array of 3)
  /// maps $value [0..1] to an interpolated color within the range of $colors
  function tonemap( $colors, $value )
  {
    let $size = $colors.length ;
    $value = clamp( $value, 0, 1 );
    let $value_int = Math.floor( $value );
    let $value_int_float = $value_int;
    let $value_size_int = Math.floor( $value * $size );
    let $index_2 = Math.min( $size-1, $value_size_int + 1 );
    let $lo = $colors[ $value_size_int ];
    let $hi = $colors[ $index_2 ];
    let $RGB = [ Math.floor( lerp( $lo[0], $hi[0], $value - $value_int_float ) ),
            Math.floor( lerp( $lo[1], $hi[1], $value - $value_int_float )),
            Math.floor( lerp( $lo[2], $hi[2], $value - $value_int_float )) 
         ];
    //echo $value + " " + $value_int_float + "\n";
    //   echo $RGB[0] + " " + $RGB[1] + " " + $RGB[2] + "\n";
    return $RGB;
  }

  // gen one "xx" byte glyph, give an array of RGB[3]'s for tonemap...
  function genbyte( $tm_colors, elt = "font" ) {
     let VERBOSE_GLYPH = false;
     let $value = Math.random() * 255;
     let $rgb = tonemap( $tm_colors, $value / 255.0 );
     //console.log( $rgb[0] + " " + $rgb[1] + " " + $rgb[2] + "\n" );
     let glyph = `<${elt} color=\"#` + str_pad( dechex( $rgb[0] ), 2, "00", "STR_PAD_LEFT" ) 
                             + str_pad( dechex( $rgb[1] ), 2, "00", "STR_PAD_LEFT" )
                             + str_pad( dechex( $rgb[2] ), 2, "00", "STR_PAD_LEFT" )
                             + "\">" + str_pad( dechex( $value ), 2, "00", "STR_PAD_LEFT" ) 
                             + `</${elt}>`;
     VERBOSE_GLYPH && console.log( "glyph: ", glyph );
     VERBOSE_GLYPH && console.log( "    0: ", str_pad( dechex( $rgb[0] ), 2, "00", "STR_PAD_LEFT" ) );
     VERBOSE_GLYPH && console.log( "    1: ", str_pad( dechex( $rgb[1] ), 2, "00", "STR_PAD_LEFT" ) );
     VERBOSE_GLYPH && console.log( "    2: ", str_pad( dechex( $rgb[2] ), 2, "00", "STR_PAD_LEFT" ) );
     return glyph;
  }

  // gen half a byte glyph - "x". give an array of RGB[3]'s for tonemap...
  function gennibble( $tm_colors, elt = "font" )
  {
  let $value = Math.random() * 15;
  let $rgb = tonemap( $tm_colors, $value / 255.0 );
  return `<${elt} color=\"#` + str_pad( dechex( $rgb[0] ), 2, "00", "STR_PAD_LEFT" ) 
                          + str_pad( dechex( $rgb[1] ), 2, "00", "STR_PAD_LEFT" )
                          + str_pad( dechex( $rgb[2] ), 2, "00", "STR_PAD_LEFT" )
                          + "\">" + str_pad( dechex( $value ), 1, "0", "STR_PAD_LEFT" ) 
                          + `</${elt}>`;
  }

  // generate one line of hexl33tOMGbaconROFLMFAO text
  function genline( $tm_colors, $cols, $row, $rows, elt = "font" )
  {
    let $s = "";
    $cols = $cols / 2;
    for (let $x = 0; $x < $cols; $x += 1)
    {
      //$value = perlin( $x / $cols, $row / $rows, 1.0, 4.0 );
      $s += genbyte( $tm_colors, elt );
    }
    return $s;
  }

  /// get strlen of only the html text that is output on the screen
  function getHtmlVisibleStrLen( $html_text )
  {
    let $text = $html_text.replace(/<[^>]*>/g, "");
    return $text.length;
  }

  /// given the text, find the offset to use, if the text is requesting to
  /// override the default.
  function detectOffsetOverride( $text, $offset, $cols )
  {
    //VERBOSE && console.log( "detectOffsetOverride, ", $text, " len:", $text.length, " offset:", $offset, " cols:", $cols );
    let $len;
    let $matches;
    // centered text (we ignore offset, because it's just centered)
    if ($matches = $text.match( /<c>(.*?)<\/c>/ ) )
    {
      VERBOSE && console.log( "centered text: match[1]: ", $matches[1] );
      $len = getHtmlVisibleStrLen( $matches[1] );
      VERBOSE && console.log( "centered text: cols:", $cols, " len:", $len, " ret:", Math.floor( ($cols - $len) / 2 ) );
      return Math.floor( ($cols - $len) / 2 );
    }
    // right justification
    else if ($matches = $text.match( /<r(\s*pos=(\d+))?>(.*?)<\/r>/ ) )
    {
       //VERBOSE && console.log( "right justification: matches: ", $matches );
      VERBOSE && console.log( "right justification: matches.len: ", $matches.length );
      if ($matches[2] === undefined)
      {
        VERBOSE && console.log( "right justification: match[3]: ", $matches[3] );
        $len = getHtmlVisibleStrLen( $matches[3] );
      }
      else
      {
        VERBOSE && console.log( "right justification: match[3]: ", $matches[3] );
        VERBOSE && console.log( "right justification: offset: ", $matches[2] );
        $len = getHtmlVisibleStrLen( $matches[3] );
        $offset = $matches[2];
      }
      VERBOSE && console.log( "right justification: ret:", $cols - $len - $offset );
      return $cols - $len - $offset;
    }
    // left justification
    else if ($matches = $text.match( /<l(\s*pos=(\d+))?>(.*?)<\/l>/ ) )
    {
       //VERBOSE && console.log( "left justification: matches: ", $matches );
      if ($matches[2] === undefined)
      {
        VERBOSE && console.log( "left justification: ret:", $offset );
        return $offset;
      }
      else
      {
        VERBOSE && console.log( "left justification: ret:", $matches[2] );
        return $matches[2];
      }
    }
    VERBOSE && console.log( "detectOffsetOverride ret:", $offset );
    return $offset;
  }
  this.detectOffsetOverride = detectOffsetOverride;

  // remove special formatting tags from text after placement
  function cleanText( $text )
  {
    $text = $text.replace( /<c>(.*?)<\/c>/, "$1" );
    $text = $text.replace( /<r(\s*pos=(\d+))?>(.*?)<\/r>/, "$3" );
    $text = $text.replace( /<l(\s*pos=(\d+))?>(.*?)<\/l>/, "$3" );
    $text = $text.replace( /<h1>(.*?)<\/h1>/, "$1" );
    return $text;
  }

  // call first to prepare the text.  adds newlines after certian special tags
  function prepText( $text )
  {
    $text = $text.replace( /<\/c>([^\n]+)/, "</c>\n$1" );
    $text = $text.replace( /<\/l>([^\n]+)/, "</l>\n$1" );
    $text = $text.replace( /<\/r>([^\n]+)/, "</r>\n$1" );
    $text = $text.replace( /<\/h1>([^\n]+)/, "</h1>\n$1" );
    // $text = $text.replace( /(\s+)<c>/, "<c>" );
    // $text = $text.replace( /(\s+)(<l(\s*pos=(\d+))?>)/, "$2" );
    // $text = $text.replace( /(\s+)(<r(\s*pos=(\d+))?>)/, "$2" );
    // $text = $text.replace( /(\s+)<h1>/, "<h1>" );
    $text = $text.replace( /([^\n]+)<c>/, "$1\n<c>" );
    $text = $text.replace( /([^\n]+)(<l(\s*pos=(\d+))?>)/, "$1\n$2" );
    $text = $text.replace( /([^\n]+)(<r(\s*pos=(\d+))?>)/, "$1\n$2" );
    $text = $text.replace( /([^\n]+)<h1>/, "$1\n<h1>" );
    return $text;
  }

  function chunkArray( myArray, chunk_size = 2 ) {
    let tempArray = [];
    for (let index = 0; index < myArray.length; index += chunk_size) {
      tempArray.push( myArray.slice( index, index + chunk_size ) );
    }
    return tempArray;
  }
  // use this to obfuscate text to look just like the random stuff
  // usage:
  // let page_text = `
  //   <c>${deadbeef.chunk( thing )}</c>
  //   `;
  // deadbeef.DrawPage( page_text, 6, 80, 3 )
  function chunk( text ) {
    return chunkArray( text.split('') ).map( r => r.join('') ).map( r => `<${this.elt} color="${this.textcolor}">${r}</${this.elt}>` ).join('');
  }

  // draw page - the main function to call to render your webpage.
  // you can put the following special tags in your $text:
  //  <c>some text</c>
  //  <l>some text</l>
  //  <r>some text</r>
  // for 'l' and 'r' tags, you can also add a 'pos' attribute to change
  // the indentation:
  //  <l pos=16>some text</l>
  // $text - the text to render, \n delimited lines of text, html tags
  //         similar to <a href=> <b>, <i>, <blink> are ok...
  // $textoffset - indentation from side margin to indent $text
  // $cols - number of columns for the background
  // $rows - number of rows for the background
  //
  // you can also set up custom page rendering attributes.  
  // copy the deadbeef global variables into your php app to override these.
  this.DrawPage = ( $text, $textoffset, $cols, $rows ) =>
  {
    let str = '';
    if (this.gen_html) {
    str += `<html><head>
      <title>${this.title}</title>   
      </head>
      <body bgcolor=\"${this.bgcolor}\" text=\"${this.textcolor}\" link=\"${this.linkcolor}\" alink=\"${this.alinkcolor}\" vlink=\"${this.vlinkcolor}\">
      <table border=0 width=100% height=100%>
      <tr valign=middle><td align=center>\n`;
    }
    str += `<pre class="deadbeef">`;
    $text = prepText( $text );
    let $textlines = $text.split( "\n" );//.map( r => prepText( r ) );
    //console.log($textlines)
    let $size_of_glyph = genbyte( this.tonemap, this.elt ).length; // size of one hex byte thingie
    let $size_of_nibble_glyph = gennibble( this.tonemap, this.elt ).length; // size of one hex byte thingie
    let $in_text = false;
    let $page = "";
    for (let $x = 0; $x < $rows; $x += 1)
    {
      let $text2write = $textlines[$x];
      let $text2write_len = getHtmlVisibleStrLen( $text2write );
      let $detectedoffset = detectOffsetOverride( $text2write, $textoffset, $cols );
      // if offset is odd, add a char to the beginning, and ensure the offset is even
      if ($detectedoffset % 2)// odd
      {
        $text2write_len = 1 + getHtmlVisibleStrLen( $text2write ); // nibble we add in next line is 1 visible char
        $text2write = gennibble( this.tonemap ) + $text2write;
        $detectedoffset -= 1;
      }
      // if the string we're writing is odd, add a char to the end.
      if ($text2write_len % 2)// odd
      {
        $text2write_len = getHtmlVisibleStrLen( $text2write ) + 1; // nibble we add in next line is 1 visible char
        $text2write += gennibble( this.tonemap );
      }
      let $line_original = genline( this.tonemap, $cols, $x, $rows, this.elt );
      //console.log( $text2write + " " + $text2write_len + " " + $detectedoffset + "\n" );
      let $line = substr_replace( $line_original,
                            $text2write, 
                            ($detectedoffset/2) * $size_of_glyph,
                            ($text2write_len / 2) * $size_of_glyph );
      $page += cleanText( $line ) + "\n";
    }
    str += $page;
    str += "</pre>";
    if (this.gen_html)
    str += "</td></tr></table></body></html>";
    return str;
  }


} // deadbeef

// module.exports = new deadbeef();
