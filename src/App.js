import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { saveAs } from "file-saver";
import ImageStop from './Kvadr.jpg'; 
import ImagePlay from './Treug.png'; 
import ImageSave from './RedCircle.png'; 
import ImageLeft from './Left.png';
import ImageUp from './Up.png';

function App() {
  const [fileName, setFileName] = useState(null);
  const [curPos, setCurPos] = useState(-1);
  const [colorStrings, setColorStrings] = useState([]);
  const [colorL, setColorL] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileBufferRef = useRef(null);
  const intervalRef = useRef(null);
  let isSpeak = false;
  var curr=curPos;
  var item = colorL[0];
var utterance = new SpeechSynthesisUtterance(``);
const [circles, setCircles] = useState([]);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
var bisLineCount=0;
const [secOnBis,setSecOnBis] = useState(0.75);
const [allCircles, setAllCircles] = useState([]);
  const [displayedCircles, setDisplayedCircles] = useState([]);
 const [currentStartIndex, setCurrentStartIndex] = useState(0);
var startIndex=currentStartIndex;

const [xrect, setXrect] = useState(82);
const [yrect, setYrect] = useState(52);
const circleDiameter = 24;
const circleMargin = 5;
const columnWidth = circleDiameter + circleMargin + 50;
const [circlesPerColumn, setCirclesPerColumn] = useState(0);

const Element=document.createElement('div');

  // Обновляем размеры контейнера при изменении размера окна
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  function intToHex(colorInt)
  {
    let b= (colorInt >>16) & 0xff;
    let g= (colorInt >>8) & 0xff;
    let r= colorInt & 0xff;
    return "#"+r.toString(16).padStart(2,0)+g.toString(16).padStart(2,0)+b.toString(16).padStart(2,0);
  }

  // вывод текста
  function displayText(text, x, y){
   //document.body.removeChild(Element);
   Element.textContent=text;
   Element.style.position='absolute';
   Element.style.left=x+'px';
   Element.style.top=y+'px';
   document.body.appendChild(Element);
  };
//--------------

  // Создание всех кругов с правильным позиционированием
  const createAllCircles = () => {
    if (!containerRef.current) return;

    const newCircles = [];
    const circleDiameter = 24;
    const circleMargin = 5;
    const circlesInColumn=Math.floor(containerSize.height / (circleDiameter + circleMargin));
    const columnWidth = circleDiameter + circleMargin + 50;
    setCirclesPerColumn(circlesInColumn);
    for (let i = 0; i < bisLineCount; i++) {
      const column = Math.floor(i / circlesInColumn);
      const positionInColumn = i % circlesInColumn;

      allCircles.push({
        id: i,
        //color: getRandomColor(),
	color: intToHex(colorL[i].color),
	ccount: colorL[i].count,
        cnum: colorL[i].colornum,
        number: i + 1,
        originalColumn: column,
        originalPosition: positionInColumn,
	top: positionInColumn * (circleDiameter + circleMargin),
        left: column * columnWidth,
      });
    }

    //setAllCircles(newCircles);
    setDisplayedCircles(allCircles);
    //setCurrentStartIndex(curr);
  };

  // Пересчет позиций для отображаемых кругов
  const calculatePositions = (circlesToDisplay) => {
    if (!containerRef.current || circlesToDisplay.length === 0) return [];

    const circlesInColumn=Math.floor(containerSize.height / (circleDiameter + circleMargin));
    setCirclesPerColumn(circlesInColumn);
    

    return circlesToDisplay.map((circle, index) => {
      const column = Math.floor(index / circlesInColumn);
      const positionInColumn = index % circlesInColumn;
      
      return {
        ...circle,
        top: positionInColumn * (circleDiameter + circleMargin),
        left: column * columnWidth,
      };
    });
  };

  function RectPos()
  {
    setXrect(columnWidth*(Math.floor((curr-startIndex) / circlesPerColumn))+82);
    setYrect(((curr-startIndex)%circlesPerColumn) * (circleDiameter + circleMargin)+52);
    //alert('x='+String(xrect)+' y='+String(yrect));
  }

  // Показать следующую последовательность (2-100, 3-100 и т.д.)
  const showNextSequence = () => {
    //alert(String(allCircles.length));
    if (startIndex >= allCircles.length - 1) return;

    const newStartIndex = startIndex + 1;
    startIndex=startIndex+1;
    //alert(String(startIndex));
    const circlesToDisplay = allCircles.slice(newStartIndex);
    const positionedCircles = calculatePositions(circlesToDisplay);

    setCurrentStartIndex(startIndex);
    setDisplayedCircles(calculatePositions(circlesToDisplay));
    //alert(String(startIndex));
  };

  // Показать предыдущую последовательность (возврат к 1-100, 2-100 и т.д.)
  const showPrevSequence = () => {
    //alert('PrevSeq1 startIndex='+String(startIndex)+' curr='+String(curr));
  
    if (startIndex <= 0) return;
    alert('PrevSeq startIndex='+String(startIndex)+' curr='+String(currentStartIndex));
    const newStartIndex = startIndex - 1;
    startIndex=startIndex-1;
    const circlesToDisplay = allCircles.slice(newStartIndex);
    const positionedCircles = calculatePositions(circlesToDisplay);

    setCurrentStartIndex(startIndex);
    setDisplayedCircles(positionedCircles);
    RectPos();
    // alert('PrevSeq2 startIndex='+String(startIndex)+' curr='+String(curr));
  
  };

//--------------
function getColor (red, green, blue)
{
  return `rgb(${red}, ${green}, ${blue}`;
}

// Генерация случайного цвета
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Открытие файла и разбор
  const handleOpen = async (e) => {
    const file = e.target.files[0];
  
    if (!file) return;

    const buffer = await file.arrayBuffer();
    fileBufferRef.current = buffer;
    setFileName(file.name);

    const dv = new DataView(buffer);
    let offset = 0;

    curr = dv.getInt32(offset, true);
    setCurPos(curr);
    //curr=curPosVal;
    offset += 4;

    const colorCount = dv.getInt32(offset, true);
    offset += 4;

    const cs = [];
    for (let i = 0; i < colorCount; i++) {
      //const r=dv.getUint8(offset,true); offset+=1;
      //alert(String(r));
      //const g=dv.getUint8(offset,true); offset+=1;
      //alert(String(g));
      //const b=dv.getUint8(offset,true); offset+=2;
      //alert(String(b));
      //const color = dv.getUint32(offset, true); offset += 4;
      const r = dv.getUint8(offset, true); offset += 1;
      const g = dv.getUint8(offset, true); offset += 1;
      const b = dv.getUint8(offset, true); offset += 1;
      const a = dv.getUint8(offset, true); offset += 1;
     // alert(String(r)+", "+String(g)+", "+String(b)+", "+String(a));
      //const color=`rgb(${r}, ${g}, ${b})`;
      //const color = dv.getUint32(offset, true); offset += 4;
      let color= (a<<24) | (r<<16) | (g<<8) | b;
      //const color = (c >> 8);
      //alert(String(color));
      const words = dv.getInt32(offset, true); offset += 4;
      const ton = dv.getInt32(offset, true); offset += 4;
      const count = dv.getInt32(offset, true); offset += 4;
      cs.push({ color, words, ton, count });
    }

    bisLineCount = dv.getInt32(offset, true);
    offset += 4;

    const cl = [];
    for (let i = 0; i < bisLineCount; i++) {
      const col = dv.getUint32(offset, true); offset += 4;
      const cou = dv.getInt32(offset, true); offset += 4;
      const num = dv.getInt32(offset, true); offset += 4;
      colorL.push({ color: col, count: cou, colornum: num });
    }

    setCurPos(curr);
    setColorStrings(cs);
    //setColorL(cl);
    createAllCircles();
    //textCount="Поз. "+String(curr);
   //document.body.appendChild(Element);
    if(curr>0) 
      {
        startIndex=curr-1;
        setCurrentStartIndex(startIndex);
        //alert(String(startIndex));
        showNextSequence();
      }
    //showNextSequence();
    //yrect=allCircles[0].top;
  };

const speakStep = () => {
    if(isSpeak===false) return;
      item = colorL[curr];
      //alert(String(curr));
      if (!item) 
        {
          alert("No item");
          return;
        }

      utterance = new SpeechSynthesisUtterance(
        `Цвет номер ${item.colornum}, ${item.count}`
      );
      utterance.onend = function (event)
      {
        if(isSpeak===false) return;
         const nextPos = curr + 1;
        curr=curr+1;
        //textCount="Поз. "+String(curr);
        //displayText("Поз. "+String(curr), 1, containerSize.height-20);
        setTimeout(speakStep, item.count * secOnBis*1000);
        setCurPos(curr);
        
	      //createCircles();
        //alert(String(startIndex));
	showNextSequence();
  RectPos();
         //alert(String(startIndex));
        if (curr < colorL.length && isSpeak) {
          //alert(String(isSpeak));
          //setTimeout(speakStep, 0);
  
        } else {
          //setIsPlaying(false);
          isSpeak=false;
          alert("FALSE")
        }
      }
      window.speechSynthesis.speak(utterance);
      
      //await new Promise(res => setTimeout(res, item.count * 500));
     
    };

  const handleStart = () => {
    
    if (isSpeak || curr >= colorL.length) 
      {
        //alert("return");
        isSpeak=false;
        return;
      }
      else{
      if(curr!=startIndex) 
      {
        startIndex=curr-1;
        setCurrentStartIndex(startIndex);
        //alert(String(startIndex));
        showNextSequence();
        RectPos();
      }
      setIsPlaying(true);
      
      isSpeak=true;
      //alert(String(startIndex));
      speakStep();
      }
  };

  const handleStop = () => {
    
    //setIsPlaying(false);
    isSpeak=false;
    
    //alert(String(isSpeak));
    window.speechSynthesis.cancel();
    //startIndex=curr;
  };

const handleBackPos = () => {
    if(isSpeak || curr==0) return;
    //alert('BackPos startIndex='+String(startIndex)+' curr='+String(curr));
  
    //startIndex=curr;
    //curr=curr-1;
    
    //displayText("Поз. "+String(curr), 1, containerSize.height-20);
    setCurPos(curr);
    showPrevSequence();
  };

  const handleBackCol = () => {
    if(isSpeak || curr==0) return;
    //alert('BackPos startIndex='+String(startIndex)+' curr='+String(curr));
  
    //startIndex=curr;
    //curr=curr-1;
    
    //displayText("Поз. "+String(curr), 1, containerSize.height-20);
    setCurPos(curr);
    if(startIndex>circlesPerColumn-1) {startIndex=startIndex-circlesPerColumn+1; setCurrentStartIndex(startIndex);}
    else {startIndex=0; setCurrentStartIndex(startIndex);}
    alert('BackCol startIndex='+String(startIndex)+'currentstartindex='+currentStartIndex);
    showPrevSequence();
  };

  const handleSave = () => {
    if (!fileBufferRef.current) return;
    const buffer = fileBufferRef.current;
    const dv = new DataView(buffer);
    dv.setInt32(0, curr, true);

    const blob = new Blob([buffer], { type: "application/octet-stream" });
    alert(fileName);
    saveAs(blob, fileName);
    //const a = document.createElement("a");
    //a.href = URL.createObjectURL(blob);
    //a.download = fileName || "output.dat";
    //a.click();
  };

  const handleChangeSec = (event) => {
    setSecOnBis(event.target.value);
  };

  return (
    <div className="app">
      <div className="buttons">
        <label className="btn"
        style={{ 
          width: '80px',
          height: '30px',
        fontSize: '18px',
        border: '1px solid black',
      
        padding: '0px 0px',
        textAlign: 'center',
        lineHeight: '30px',
        color: 'black',
        }}
        
        >Открыть<input type="file" hidden onChange={handleOpen} />
        </label>

        <button title="Записать"
        style={{ 
          width: '30px',
          height: '30px',
        fontSize: '64px',
        fontWeight: 'bold',
        padding: '0px 0px',
        textAlign: 'center',
        lineHeight: '0px',
        color: 'red',
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        maxHeight: '100%',
        maxWidth: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        }}
        onClick={handleSave}><img src={ImageSave} alt="Save" width="20" height="20"/></button>
        
        <button title="Диктовать"
        style={{ 
          width: '30px',
          height: '30px',
        fontSize: '28px',
        fontWeight: 'bold',
        padding: '0px 0px',
        textAlign: 'center',
        lineHeight: '0px',
        color: 'black',
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        maxHeight: '100%',
        maxWidth: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        }}
        onClick={handleStart}> <img src={ImagePlay} alt="Play" width="20" height="20"/> </button>
        
        <button title="Остановить"
        style={{ 
          width: '30px',
          height: '30px',
        fontSize: '36px',
        fontWeight: 'bold',
        padding: '0px 0px',
        textAlign: 'center',
        lineHeight: '20px',
        color: 'black',
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        maxHeight: '100%',
        maxWidth: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        }}
        onClick={handleStop}>  <img src={ImageStop} alt="Stop" width="20" height="20"/> </button>
      
      <button title="Сдвиг на 1 позицию для просмотра"
        style={{ 
          width: '30px',
          height: '30px',
        fontSize: '24px',
        fontWeight: 'bold',
        padding: '0px 0px',
        textAlign: 'center',
        lineHeight: '20px',
        color: 'black',
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        maxHeight: '100%',
        maxWidth: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        
        }}
        onClick={handleBackPos}> <img src={ImageUp} alt="1 item up" width="20" height="20"/> </button>

        <button title="Сдвиг на столбик для просмотра"
        style={{ 
          width: '30px',
          height: '30px',
        fontSize: '24px',
        fontWeight: 'bold',
        padding: '0px 0px',
        textAlign: 'center',
        lineHeight: '20px',
        color: 'black',
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        maxHeight: '100%',
        maxWidth: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        
        }}
        onClick={handleBackCol}> <img src={ImageLeft} alt="1 col left" width="20" height="20"/> </button>
        
        <input
        style={{ 
          width: '45px',
          height: '26px',
        fontSize: '14px',
        padding: '0px 0px',
        color: 'black',
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        }}
      type="number"
      step="0.25"
      value={secOnBis}
      onChange={handleChangeSec}
      
    />

      </div>


      <div className="content">
        <div className="left-panel">
          {colorStrings.map((item, idx) => (
            <div key={idx} className="circle-row">
              <div className="circle" style={{ backgroundColor: `#${item.color.toString(16).padStart(6, "0")}`}}></div>
              <div>{item.count}</div>
            </div>
          ))}
        </div>

        <div ref={containerRef}
          style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 100px)',
          border: '1px solid #ccc',
          overflow: 'auto',
         margin: '0px'
        }}
        >
          {displayedCircles.map((circle) => (
          <div
            key={circle.id}
            style={{
              position: 'absolute',
              top: `${circle.top}px`,
              left: `${circle.left}px`,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: circle.color,
              border: '1px solid black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
            }}
          >
            <div style={{
              position: 'absolute',
              left: '30px',
              color: 'black',
              width: '30px',
              textAlign: 'left',
              fontSize: '16px',
              
            }}>
              {circle.ccount}
            </div>
            <div style={{
              position: 'absolute',
              left: '3px',
              color: 'black',
              width: '8px',
              textAlign: 'left',
             
              fontSize: '14px',
              
              textShadow: '0 0 0 #000, 2px 0 0 #ffffff, -2px 0 0 #ffffff, 0 2px 0 #ffffff, 0 -2px 0 #ffffff',
            }}>
              {circle.cnum}
            </div>
          </div>
        ))}
        </div>

        <div className="rectangle"
        style={{
              width: '60px',
              height: '24px',
              border: '2px solid red',
              left: `${xrect}px`,
              top: `${yrect}px`,
            }}>
          
        </div>
        <div style={{
              position: 'absolute',
              left: '1px',
              top: `${containerSize.height}px`,
              textAlign: 'left',
            }}>
              {"Поз.:"+`${curr+1}`}
          </div>
          <div style={{
              position: 'absolute',
              left: '1px',
              top: `${containerSize.height+20}px`,
              textAlign: 'left',
            }}>
              {"из:"+colorL.length}
          </div>
      </div>

      
    </div>
  );
}

export default App;
