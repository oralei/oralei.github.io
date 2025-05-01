// Register variables - BOTTOM JavaScript file!

let noButton = document.getElementById("noButton");
noButton.addEventListener("click", noEvent);

let yesButton = document.getElementById("yesButton");
yesButton.addEventListener("click", yesEvent);

let secretButton = document.getElementById("secretButton");
secretButton.addEventListener("click", noEvent);

let buttonStage = 0;
var audio = new Audio("audio/buzz.mp3");
var ding = new Audio("audio/ding.mp3");
var music = new Audio("audio/valentine.mp3");

function noEvent(event) {
  audio.play();
  console.log("You clicked no!");
  let noButton = document.getElementById("noButton");
  let yesButton = document.getElementById("yesButton");

  if (buttonStage == 0) {
    // "NO Button" changes 1
    noButton.style.width = "50px";
    noButton.style.fontSize = "15px";

    // "YES Button" changes 1
    yesButton.style.width = "200px";
    yesButton.style.fontSize = "40px";
    yesButton.style.fontWeight = "bold";
    yesButton.value = "YES";
  }
  if (buttonStage == 1) {
    // "NO Button" changes 2
    noButton.style.padding = "5px 0px 5px 0px";
    noButton.style.width = "20px";
    noButton.style.fontSize = "8px";

    // "YES Button" changes 2
    yesButton.style.width = "350px";
    yesButton.style.paddingBottom = "20px";
    yesButton.style.fontSize = "60px";
    yesButton.style.fontWeight = "bold";
    yesButton.value = "YES?";
  }

  if (buttonStage == 2) {
    // "NO Button" changes 3
    noButton.style.padding = "5px 0px 5px 0px";
    noButton.style.width = "50px";
    noButton.style.fontSize = "8px";
    noButton.value = "no ;(";

    // Declare a fragment:
    var fragment = document.createDocumentFragment();

    // Append desired element to the fragment:
    fragment.appendChild(document.getElementById("noDiv"));

    // Append fragment to desired element:
    document.getElementById("rightGrid").appendChild(fragment);

    // "YES Button" changes 3
    yesButton.style.padding = "30px 0px 30px 0px";
    yesButton.style.width = "600px";
    yesButton.style.fontSize = "100px";
    yesButton.style.fontWeight = "bolder";
    yesButton.value = "YES!!";
  }

  if (buttonStage == 3) {
    let mainTitle = document.getElementById("mainTitle");
    mainTitle.style.display = "none";

    // Secret message:
    let secretMessage = document.getElementById("secretID");
    secretMessage.style.display = "block";

    // "NO Button" changes 4
    noButton.style.display = "none";

    // "YES Button" changes 4
    yesButton.style.width = "220px";
    yesButton.style.fontSize = "20px";
    yesButton.style.fontWeight = "bold";
    yesButton.style.position = "relative";
    yesButton.style.top = "50px";
    yesButton.value = "yes...";
  }

  if (buttonStage == 4) {
    mainTitle.style.display = "initial";

    // Secret message:
    let secretMessage = document.getElementById("secretID");
    secretMessage.style.display = "none";

    document.getElementById("mainTitle").innerHTML =
      "how did you even find that?";

    // "NO Button" changes 5
    noButton.style.display = "none";

    // "YES Button" changes 5
    yesButton.style.width = "270px";
    yesButton.style.fontSize = "20px";
    yesButton.style.fontWeight = "bold";
    yesButton.value = "im smart like that";
  }

  buttonStage++;
}

// If the yes button is clicked at any point
function yesEvent(event) {
  ding.play();
  let secretMessage = document.getElementById("secretID");
  secretMessage.style.display = "none";

  let mainTitle = document.getElementById("mainTitle");
  mainTitle.style.display = "initial";

  document.getElementById("mainTitle").innerHTML = "yay!!";

  if (buttonStage == 5) {
    document.getElementById("mainTitle").innerHTML =
      "maybe next year ill be the one...";
  }
  let title = document.getElementById("mainTitle");
  title.style.fontSize = "50px";
  title.style.textAlign = "center";

  let gif = document.getElementById("flowers");
  gif.style.display = "initial";
  gif.style.justifyContent = "center";
  gif.style.marginTop = "20px";

  let note = document.getElementById("message");
  note.style.display = "initial";

  yesButton.style.display = "none";
  noButton.style.display = "none";

  console.log("You clicked yes!");

  music.play();
}

const removeWatermark = () => {
  const ids = [];
  const iframes = document.body.querySelectorAll("iframe");
  for (const iframe of iframes) {
    if (iframe.id.startsWith("sb__open-sandbox")) ids.push(iframe.id);
  }
  for (const id of ids) {
    const node = document.createElement("div");
    node.style.setProperty("display", "none", "important");
    node.id = id;
    document.getElementById(id).remove();
    document.body.appendChild(node);
  }
};

setTimeout(removeWatermark, 0);
