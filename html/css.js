$(function () {
    var styleTooltip = document.createElement('style');
    var styleLocation = document.createElement('style');
    var styleTable = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(styleTooltip);
    document.getElementsByTagName('head')[0].appendChild(styleLocation);
    document.getElementsByTagName('head')[0].appendChild(styleTable);
    window.addEventListener("message", function (event) {
        // when the tooltip is placed within the world map, this update its position every tick
        if (event.data.type === "updatetooltipposition") {
            var tooltipTable = document.getElementById("tooltiptable");
            var newX = event.data.x;
            var newY = event.data.y;
            if (event.data.progressbaraligncenter) {
                var halfProgressBarSize = tooltipTable.clientWidth / 2;
                var viewportWidth = $(window).width();
                var percentIncrement = halfProgressBarSize / viewportWidth * 100;
                newX -= percentIncrement;
            }
            styleLocation.innerHTML = "#location { position: fixed; top: " + newY + "%; left: " + newX + "%; }";
        }
        else if (event.data.type === "updateprogressbar") {
            var line = event.data.line;
            var percent = event.data.percent;
            var color = event.data.color;
            var lineProgressBar = document.getElementById("clBody" + line);
            lineProgressBar.innerHTML = ".clBody" + line + "{\n                background: -webkit-linear-gradient(left, #" + toHex(color) + " " + percent + "%, #00000000 0%);\n            }";
        }
        else if (event.data.type === "updatetext") {
            var line = event.data.line;
            var leftText = event.data.leftText;
            var rightText = event.data.rightText;
            var tr = document.getElementById("rwRow" + line).children;
            var leftTd = tr[0];
            var rightTd = tr[1];
            if (leftText) {
                leftTd.innerHTML = leftText;
            }
            if (rightText) {
                rightTd.innerHTML = rightText;
            }
        }
        else if (event.data.type === "tooltipsetup") {
            // these are the default values for the <div> that wrap the tooltip <table>
            var tooltipCSS = "#container {\n                font-size: 16px;\n                padding: 4px;\n                background-color: rgba(29, 30, 40, 0.834);\n                border: 2px outset;\n                border-color: #b2b2b1 #d0d0d0 #d0d0d0 #b2b2b1;\n                box-shadow: 0px 0px 5px #000000BD;\n                border-radius: 8px;\n                width: auto;\n                height: auto;\n            ";
            // get the values set by the user and add or overwrite in the default table
            var tableCSS = event.data.tableCSS;
            var i = void 0;
            for (i = 0; i < tableCSS.length; i++) {
                tooltipCSS = tooltipCSS + tableCSS[i] + ";\n";
            }
            tooltipCSS = tooltipCSS + "}";
            styleTooltip.innerHTML = tooltipCSS;
            // css for the tooltip <table>
            styleTable.innerHTML = "\n            #tooltiptable\n            {\n\n            }";
        }
    });
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
    function _debug(msg) {
        this.console.log(msg);
    }
});
