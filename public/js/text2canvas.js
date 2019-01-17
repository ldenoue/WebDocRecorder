function makeCanvas(text,pagew,fontsize,fontfamily)
{
  if (!pagew)
  {
    pagew = 900;
  }
  if (!fontsize)
  {
    fontsize = 16;
  }
  if (!fontfamily)
    fontfamily = 'monospace';
  var fontwidth = (fontsize * 0.6)|1;
  var res = [];
  var marginLeft = 32;
  var marginTop = 50;
  var cols = ((pagew-2*marginLeft) / fontwidth)|0;
  var vertSpace = (fontsize * 1.4)|1;
  var pageHeight = 792;
  var pageWidth = pagew|1;
  var pageHeight = ((792 * pagew) / 612)|1;
  var lines = ((pageHeight-2*marginTop) / vertSpace) | 0;

  function emptyCanvas(w,h)
  {
    var canvas = document.createElement('canvas');
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    var ctx = canvas.getContext('2d');
    ctx.font = fontsize + 'px ' + fontfamily;
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,pageWidth,pageHeight);
    ctx.fillStyle = 'black';
    ctx.textBaseline= 'top'; 
    return canvas;
  }
  
  var canvas = emptyCanvas(pageWidth,pageHeight);
  var ctx = canvas.getContext('2d');
  res.push(canvas);
  var x = marginLeft;
  var y = marginTop;
  var ncols = 0;
  var nlines = 0;
  for (var i=0;i<text.length;i++)
  {
    ncols++;
    var c = text[i];
    if (c == '\n')
    {
      ncols = 0;
      nlines++;
      if (nlines >= lines)
      {
        nlines = 0;
        canvas = emptyCanvas(pageWidth,pageHeight);
        ctx = canvas.getContext('2d');
        res.push(canvas);
        x = marginLeft;
        y = marginTop;
      }
      else
      {
        x = marginLeft;
        y += vertSpace;
      }
    }
    else
    {
      ctx.fillText(c,x,y);
      x += fontwidth;
      if (ncols >= cols)
      {
        ncols = 0;
        nlines++;
        if (nlines >= lines)
        {
          nlines = 0;
          canvas = emptyCanvas(pageWidth,pageHeight);
          ctx = canvas.getContext('2d');
          res.push(canvas);
          x = marginLeft;
          y = marginTop;
        }
        else
        {
          x = marginLeft;
          y += vertSpace;
        }
      }
    }
  }
  return res;
}

function makeHTMLCanvas(elements,pagew,fontsize,fontfamily)
{
  if (!pagew)
  {
    pagew = 900;
  }
  if (!fontsize)
  {
    fontsize = 16;
  }
  if (!fontfamily)
    fontfamily = 'monospace';
  var fontwidth = (fontsize * 0.6)|1;
  var res = [];
  var marginLeft = 32;
  var marginTop = 50;
  var cols = ((pagew-2*marginLeft) / fontwidth)|0;
  var vertSpace = (fontsize * 1.4)|1;
  var pageHeight = 792;
  var pageWidth = pagew|1;
  var pageHeight = ((792 * pagew) / 612)|1;
  var lines = ((pageHeight-2*marginTop) / vertSpace) | 0;

  var text = '';
  var colors = [];
  for (var i=0;i<elements.length;i++)
  {
    text += elements[i].text;
    for (var j=0;j<elements[i].text.length;j++)
      colors.push(elements[i].color);
  }
  //console.error('text=',text);

  function emptyCanvas(w,h)
  {
    var canvas = document.createElement('canvas');
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    var ctx = canvas.getContext('2d');
    ctx.font = fontsize + 'px ' + fontfamily;
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,pageWidth,pageHeight);
    ctx.fillStyle = 'black';
    ctx.textBaseline= 'top'; 
    return canvas;
  }
  
  var canvas = emptyCanvas(pageWidth,pageHeight);
  var ctx = canvas.getContext('2d');
  res.push(canvas);
  var x = marginLeft;
  var y = marginTop;
  var ncols = 0;
  var nlines = 0;
  for (var i=0;i<text.length;i++)
  {
    ncols++;
    var c = text[i];
    if (c == '\n')
    {
      ncols = 0;
      nlines++;
      if (nlines >= lines)
      {
        nlines = 0;
        canvas = emptyCanvas(pageWidth,pageHeight);
        ctx = canvas.getContext('2d');
        res.push(canvas);
        x = marginLeft;
        y = marginTop;
      }
      else
      {
        x = marginLeft;
        y += vertSpace;
      }
    }
    else
    {
      var color = colors[i];
      ctx.fillStyle = color;
      ctx.fillText(c,x,y);
      x += fontwidth;
      if (ncols >= cols)
      {
        ncols = 0;
        nlines++;
        if (nlines >= lines)
        {
          nlines = 0;
          canvas = emptyCanvas(pageWidth,pageHeight);
          ctx = canvas.getContext('2d');
          res.push(canvas);
          x = marginLeft;
          y = marginTop;
        }
        else
        {
          x = marginLeft;
          y += vertSpace;
        }
      }
    }
  }
  return res;
}
