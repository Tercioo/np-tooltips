
$(function () 
{
    
    var styleTooltip = document.createElement('style');
    var styleLocation = document.createElement('style');
    var styleTable = document.createElement('style');

    document.getElementsByTagName('head') [0].appendChild(styleTooltip);
    document.getElementsByTagName('head') [0].appendChild(styleLocation);
    document.getElementsByTagName('head') [0].appendChild(styleTable);

    window.addEventListener("message", function(event) 
	{
        // when the tooltip is placed within the world map, this update its position every tick
        if (event.data.type === "updatetooltipposition")
        {
            let tooltipTable = document.getElementById("tooltiptable");

            let newX = event.data.x as number;
            let newY = event.data.y as number;

            if (event.data.progressbaraligncenter)
            {
                let halfProgressBarSize = tooltipTable.clientWidth / 2;
                let viewportWidth = $(window).width();
                let percentIncrement = halfProgressBarSize / viewportWidth * 100;
                newX -= percentIncrement;
            }

            styleLocation.innerHTML = `#location { position: fixed; top: ${newY}%; left: ${newX}%; }`;
        }

        else if (event.data.type === "updateprogressbar")
        {
            let line = event.data.line;
            let percent = event.data.percent as number;
            let color = event.data.color;

            let lineProgressBar = document.getElementById(`clBody${line}`);
            lineProgressBar.innerHTML = `.clBody${line}{
                background: -webkit-linear-gradient(left, #${toHex(color)} ${percent}%, #00000000 0%);
            }`;
        }

        else if (event.data.type === "updatetext")
        {
            let line = event.data.line;
            let leftText = event.data.leftText;
            let rightText = event.data.rightText;

            let tr = document.getElementById(`rwRow${line}`).children;
            let leftTd = tr[0];
            let rightTd = tr[1];
            
            if (leftText)
            {
                leftTd.innerHTML = leftText;
            }

            if (rightText)
            {
                rightTd.innerHTML = rightText;
            }
        }

        else if (event.data.type === "tooltipsetup")
        {
            // these are the default values for the <div> that wrap the tooltip <table>
            let tooltipCSS = `#container {
                font-size: 16px;
                padding: 4px;
                background-color: rgba(29, 30, 40, 0.834);
                border: 2px outset;
                border-color: #b2b2b1 #d0d0d0 #d0d0d0 #b2b2b1;
                box-shadow: 0px 0px 5px #000000BD;
                border-radius: 8px;
                width: auto;
                height: auto;
            `;

            // get the values set by the user and add or overwrite in the default table
            let tableCSS = event.data.tableCSS;

            let i: number;
            for (i = 0; i < tableCSS.length; i++) 
            {
                tooltipCSS = tooltipCSS + tableCSS [i] + `;\n`;
            }

            tooltipCSS = tooltipCSS + `}`;
            styleTooltip.innerHTML = tooltipCSS;
           

            // css for the tooltip <table>
            styleTable.innerHTML = `
            #tooltiptable
            {

            }`;

        }
	})
    
    function toHex(colorTable)
    {
        let colorHex = "";

        let i: number;
        for (i = 0; i < colorTable.length; i++)
        {
            let hex = colorTable [i].toString (16);
            if (hex === "0")
            {
                hex = "00";
            }

            colorHex = colorHex + hex;
        }
        return colorHex;
    }

    function _debug(msg)
    {
        this.console.log(msg);
    }	
})
