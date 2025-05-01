// Event Registration

let selectCell = document.getElementById("main-table");
selectCell.addEventListener("click", drawFunction);

let clearTableButton = document.getElementById("clear-button");
clearTableButton.addEventListener("click", clearTable);

let sliderHeight = document.getElementById("canvas-height");
sliderHeight.addEventListener("click", clearTable);

let selectLightShaded = document.getElementById("select-l-shaded");
selectLightShaded.addEventListener("click", selectColorLightShaded);

let selectMediumShaded = document.getElementById("select-m-shaded");
selectMediumShaded.addEventListener("click", selectColorMediumShaded);

let selectDarkShaded = document.getElementById("select-d-shaded");
selectDarkShaded.addEventListener("click", selectColorDarkShaded);

let selectSolid = document.getElementById("select-solid");
selectSolid.addEventListener("click", selectColorSolid);

let selectBlock = document.getElementById("select-block");
selectBlock.addEventListener("click", selectColorBlock);

let selectTop = document.getElementById("select-top");
selectTop.addEventListener("click", selectColorTop);

let selectBottom = document.getElementById("select-bottom");
selectBottom.addEventListener("click", selectColorBottom);

let selectLeft = document.getElementById("select-left");
selectLeft.addEventListener("click", selectColorLeft);

let selectRight = document.getElementById("select-right");
selectRight.addEventListener("click", selectColorRight);

let fillButton = document.getElementById("fill-button");
fillButton.addEventListener("click", fillCanvas);

let copyButton = document.getElementById("copy-button");
copyButton.addEventListener("click", copyToClipboard);

// Even Handling

let mainTable = document.getElementById("main-table");

let canvasHeight = document.getElementById("canvas-height").value

let selectedColor = "█";

let colorLightShaded = "░";
let colorMediumShaded = "▒";
let colorDarkShaded = "▓";
let colorSolid = "█";
let colorBlock = "■";
let colorTop = "▀";
let colorBottom = "▄";
let colorLeft = "▌";
let colorRight = "▐";


function makeTable(tableColor){
    for (let i = 0; i < document.getElementById("canvas-height").value; i++){
        let newRow = document.createElement("tr");
        mainTable.appendChild(newRow);
    
        for (let j = 0; j < 26; j++)
        {
            let newCell = document.createElement("td");
            newCell.innerHTML = tableColor;
            newRow.appendChild(newCell);
        }
    }
}

function drawFunction(event){
    const cell = event.target.closest('td');
    if (!cell) {return;} // Quit, not clicked on a cell
    const row = cell.parentElement;
    console.log(cell.innerHTML, row.rowIndex, cell.cellIndex);
    cell.innerHTML = selectedColor;
}

function selectColorLightShaded(event){
    selectedColor = colorLightShaded;
}

function selectColorMediumShaded(event){
    selectedColor = colorMediumShaded;
}

function selectColorDarkShaded(event){
    selectedColor = colorDarkShaded;
}

function selectColorSolid(event){
    selectedColor = colorSolid;
}

function selectColorBlock(event){
    selectedColor = colorBlock;
}

function selectColorTop(event){
    selectedColor = colorTop;
}

function selectColorBottom(event){
    selectedColor = colorBottom;
}

function selectColorLeft(event){
    selectedColor = colorLeft;
}

function selectColorRight(event){
    selectedColor = colorRight;
}

function clearTable(event){
    while (mainTable.firstChild) {
        mainTable.removeChild(mainTable.lastChild);
    }
    makeTable("‎ ");
}

function fillCanvas(event){
    while (mainTable.firstChild) {
        mainTable.removeChild(mainTable.lastChild);
    }
    makeTable(selectedColor);
}

function copyToClipboard(event){ 
    var table = document.getElementById("main-table");

    if (navigator.clipboard) {
        var text = table.innerText.trim();
        text = text.replaceAll("	",'');
        navigator.clipboard.writeText(text).catch(function () { });
    }

    console.log(text);
}

makeTable("░");
console.log("loaded");
