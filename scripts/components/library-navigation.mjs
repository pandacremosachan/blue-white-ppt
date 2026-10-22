import {C,FONT,header,lead,text,line} from './research-components.mjs';

function table(slide,values,x,y,width,columnWidths,rowHeight,fontSize){
  const t=slide.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width,height:values.length*rowHeight,columnWidths,values});
  t.styleOptions={headerRow:false,bandedRows:false};
  t.borders.assign({fill:C.border,width:.8,style:'solid'});
  t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({margins:{left:8,right:6,top:2,bottom:2}});
  for(let r=0;r<values.length;r++){
    t.rows[r].height=rowHeight;
    for(let c=0;c<values[0].length;c++){
      const cell=t.getCell(r,c);
      cell.fill=r===0?C.blue:r%2?C.white:C.bluePale;
      cell.text.style={typeface:FONT,fontSize,color:r===0?C.white:C.ink,bold:r===0,alignment:c===1?'left':'center',verticalAlignment:'middle',insets:{left:0,right:0,top:0,bottom:0},wrap:'square',autoFit:'none'};
    }
  }
  return t;
}

export function drawContents(slide,sections){
  header(slide,'目录','全库目录');
  lead(slide,['节号定位主题，C01–C39定位组件；页脚标注本节名称和当前页码。']);
  const values=[['节号','章节名称','页码范围','小节编号'],...sections.map(s=>[
    s.number,s.title,s.introSlide===s.endSlide?String(s.introSlide):`${s.introSlide}–${s.endSlide}`,s.subsections.length?`${s.subsections[0].number}–${s.subsections.at(-1).number}`:'使用与风格说明',
  ])];
  return table(slide,values,48,198,1184,[92,592,220,280],51,22);
}

export function drawComponentIndex(slide,components,firstPages){
  header(slide,'索引','组件编号与样例索引');
  lead(slide,['C01–C39为统一组件编号，同编号样例是造型或组合变体。页码指首次展示页。']);
  const tables=[];
  for(let column=0;column<3;column++){
    const items=components.slice(column*13,column*13+13);
    const values=[['编号','组件名称','首见页'],...items.map(item=>[item.code,item.name,String(firstPages.get(item.id))])];
    tables.push(table(slide,values,48+column*404,198,376,[62,236,78],34,18));
  }
  return tables;
}

export function drawPageFooter(slide,page,total){
  line(slide,'navigation.rule',48,698,1184,0,C.border,.55);
  const section=page.kind==='contents'?'目录':page.kind==='component-index'?'组件索引':`第${page.number.split('.')[0]}节　${page.sectionTitle??page.title}`;
  text(slide,'navigation.section',section,48,700,950,19,12,C.muted,false);
  text(slide,'navigation.page',`${String(page.slide).padStart(2,'0')} / ${total}`,1030,700,202,19,12,C.blueText,false,'right');
}
