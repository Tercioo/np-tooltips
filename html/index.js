$(function () {
    var tooltipElements = [];
    var headElement = document.getElementsByTagName('head')[0];
    // max amount of columns that a row can have
    var COLUMNS_PER_LINE = 4;
    // css automatically added into <td>
    var DEFAULT_TD_CSS = "\n        vertical-align: middle;\n\t\tpadding-top: 2px;\n        padding-bottom: 2px;\n    ";
    /* columns debug
        border: 2px outset;
        border-color: #b2b2b1 #d0d0d0 #d0d0d0 #b2b2b1;
        border-radius: 1px;
    */
    // default text alignment witnin the column, the first two columns are considered 'left' 3rd and 4th are 'right' columns
    // left icon and text by default are align to left and right text and icon are align to right (first two and last 2 columns of a row)
    // add "text-align: left|right" into the table css from AddLine() AddIcon() in lua to override these values
    var DEFAULT_LEFT_TEXT_ALIGN = "left";
    var DEFAULT_RIGHT_TEXT_ALIGN = "right";
    //listeners
    window.addEventListener("message", function (event) {
        var data = event.data;
        // see what event has been passed from lua
        switch (data.type) {
            //remove all elements from the main table
            case "cleartooltip":
                {
                    var tooltipTable = document.getElementById("tooltiptable");
                    while (tooltipTable.hasChildNodes()) {
                        tooltipTable.removeChild(tooltipTable.firstChild);
                    }
                    tooltipElements.length = 0;
                    hideTooltip();
                    break;
                }
            case "alllinessent":
                {
                    // not defined yet
                    // let tooltipTable = document.getElementById ("tooltiptable");
                    break;
                }
            //add a tooltip line
            case "newtooltipline":
                {
                    // line contents
                    var lineData = data.line;
                    // tr css data
                    var tdCSS = data.tdCSS;
                    // td css data
                    var trCSS = data.trCSS;
                    // line number
                    var lineId = data.id;
                    // tooltip lines parent
                    var tooltipTable = document.getElementById("tooltiptable");
                    // counter for tds created, is used to create an id for td
                    var tdCounter = (lineId * 20) + 1;
                    // amount of columns added, this is used to set the colspan id in the last td added
                    var spanCounter = 0;
                    // store which was the latest column added
                    var latestTdAdded = null;
                    //make a tbody
                    var tBodyId = "tbBody" + lineId;
                    var tBodyClassId = "clBody" + lineId;
                    var tBody = document.createElement("tbody");
                    tBody.setAttribute("id", tBodyId);
                    tBody.setAttribute("class", tBodyClassId);
                    tooltipTable.appendChild(tBody);
                    tooltipElements.push(tBodyId);
                    // make a new <tr>
                    var rowId = "rwRow" + lineId;
                    var tr = this.document.createElement("tr");
                    tr.setAttribute("id", rowId);
                    tBody.appendChild(tr);
                    tooltipElements.push(rowId);
                    // [9] is percent of a progress bar
                    if (typeof (lineData[9]) == "number") {
                        setCSS(rowId, trCSS, tBodyClassId, true, { percent: lineData[9], color: toHex(lineData[10]) }, tBody);
                    }
                    else {
                        setCSS(rowId, trCSS, tBodyClassId, true);
                    }
                    var leftText = lineData[0];
                    var rightText = lineData[1];
                    var leftColor = lineData[2]; // array with colors {255, 255, 255}
                    var rightColor = lineData[3];
                    var fontSize = lineData[4]; // font size for both texts
                    var leftIcon = lineData[5]; // icon data
                    var rightIcon = lineData[6];
                    var iconWidth = lineData[7];
                    var iconHeight = lineData[8];
                    // left icon
                    if (leftIcon) {
                        tdCounter++;
                        spanCounter++;
                        var td = addIcon(tr, leftIcon, iconWidth, iconHeight, 1, tdCounter, tdCSS);
                        latestTdAdded = td;
                    }
                    // left text
                    if (leftText) {
                        tdCounter++;
                        spanCounter++;
                        //replace all break lines added in lua to <br>
                        leftText = leftText.split("\n").join("<br>");
                        var td = addLine(tr, leftText, 1, tdCounter, tdCSS);
                        // values passed through AddLine() in Lua
                        td.style.color = toHex(leftColor);
                        td.style.fontSize = fontSize;
                        latestTdAdded = td;
                    }
                    // right text
                    if (rightText) {
                        tdCounter++;
                        spanCounter++;
                        //replace all break lines added in lua to <br>
                        rightText = rightText.split("\n").join("<br>");
                        var td = addLine(tr, rightText, 2, tdCounter, tdCSS);
                        // values passed through AddLine() in Lua
                        td.style.color = toHex(rightColor);
                        td.style.fontSize = fontSize;
                        latestTdAdded = td;
                    }
                    // right icon
                    if (rightIcon) {
                        tdCounter++;
                        spanCounter++;
                        var td = addIcon(tr, rightIcon, iconWidth, iconHeight, 2, tdCounter, tdCSS);
                        latestTdAdded = td;
                    }
                    // add colspan to latest column created on this line
                    if (latestTdAdded) {
                        // if starts with -1 it works
                        // if starts with 0 it skip 1 td
                        var spanAmount = Math.abs(spanCounter - COLUMNS_PER_LINE);
                        latestTdAdded.setAttribute("colspan", spanAmount + 1);
                    }
                    // close the line
                    //tooltipTable.appendChild (tr)
                    break;
                }
            case "showtooltip":
                {
                    showTooltip();
                    break;
                }
            case "hidetooltip":
                {
                    hideTooltip();
                    break;
                }
        }
    });
    // create a new css element and attach it into the header
    // adds the default css if any and adds the css passed from the lua file
    function setCSS(id, cssData, tBodyClassId, isRow, backgroundInfo, tbody) {
        if (tBodyClassId === void 0) { tBodyClassId = ""; }
        if (isRow === void 0) { isRow = false; }
        if (backgroundInfo === void 0) { backgroundInfo = false; }
        if (tbody === void 0) { tbody = false; }
        var newStyleSheet = document.createElement("style");
        //newStyleSheet.type = 'text/css';
        headElement.appendChild(newStyleSheet);
        if (!isRow) {
            var elementCSS = "#" + id + " {" + DEFAULT_TD_CSS + "\n";
            var i = void 0;
            for (i = 0; i < cssData.length; i++) {
                elementCSS = elementCSS + cssData[i] + ";\n";
            }
            elementCSS = elementCSS + "}";
            newStyleSheet.innerHTML = elementCSS;
        }
        else {
            if (backgroundInfo) {
                var elementCSS = "#" + id + " {\n";
                var i = void 0;
                for (i = 0; i < cssData.length; i++) {
                    elementCSS = elementCSS + cssData[i] + ";\n";
                }
                elementCSS = elementCSS + "}";
                newStyleSheet.innerHTML = elementCSS;
                //statusbar
                var backgroundColor = backgroundInfo.color;
                var backgroundPercent = backgroundInfo.percent;
                var progressBarStyleSheet = document.createElement("style");
                //progressBarStyleSheet.type = 'text/css';
                progressBarStyleSheet.id = tBodyClassId;
                tbody.appendChild(progressBarStyleSheet);
                progressBarStyleSheet.innerHTML = "." + tBodyClassId + " {\n                    background: -webkit-linear-gradient(left, #" + toHex(backgroundColor) + " " + backgroundPercent + "%, #00000000 0%);\n                }";
            }
            else {
                var elementCSS = "#" + id + " {\n";
                var i = void 0;
                for (i = 0; i < cssData.length; i++) {
                    elementCSS = elementCSS + cssData[i] + ";\n";
                }
                elementCSS = elementCSS + "}";
                newStyleSheet.innerHTML = elementCSS;
            }
        }
    }
    function addLine(parent, text, textSide, tdCounter, tdCSS) {
        var id = "cl" + tdCounter;
        var td = document.createElement("td");
        td.setAttribute("id", id);
        parent.appendChild(td);
        tooltipElements.push(id);
        // make the text align with the side it is placed on
        switch (textSide) {
            case 1: // left text
                {
                    //td.style.textAlign = DEFAULT_LEFT_TEXT_ALIGN;
                    break;
                }
            case 2: // right text
                {
                    //td.style.textAlign = DEFAULT_RIGHT_TEXT_ALIGN;
                    break;
                }
        }
        setCSS(id, tdCSS);
        td.innerHTML = text;
        return td;
    }
    // icon side is 1 for left and 2 for right, it's the actually array index
    function addIcon(parent, iconTexture, iconWith, iconHeight, iconSide, tdCounter, tdCSS) {
        // does the icon has something in
        if (iconTexture !== "") {
            // add icon
            var id = "cl" + tdCounter;
            var td = document.createElement("td");
            td.setAttribute("id", id);
            parent.appendChild(td);
            tooltipElements.push(id);
            // make the icon align with the side it is placed on
            switch (iconSide) {
                case 1: // left text
                    {
                        //td.style.textAlign = DEFAULT_LEFT_TEXT_ALIGN;
                        break;
                    }
                case 2: //right text
                    {
                        //td.style.textAlign = DEFAULT_RIGHT_TEXT_ALIGN;
                        break;
                    }
            }
            setCSS(id, tdCSS);
            td.innerHTML = "<img src=\"" + iconTexture + "\" width=\"" + iconWith + "}\" height=" + iconHeight + "></img>";
            return td;
        }
    }
    function toHex(colorTable) {
        var colorHex = "";
        var i;
        for (i = 0; i < colorTable.length; i++) {
            var hex = colorTable[i].toString(16);
            if (hex === "0") {
                hex = "00";
            }
            colorHex = colorHex + hex;
        }
        return colorHex;
    }
    function showTooltip() {
        $("#container").show();
    }
    function hideTooltip() {
        $("#container").hide();
    }
    function _debug(msg1) {
        this.console.log(msg1);
    }
});
