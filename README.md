# np-tooltips
Create tooltips for any kind of use, supports CSS.


- Getting the tooltip object:
local tooltipObject = exports ["np-tooltips"]:GetTooltip()

- Clear the latest tooltip shown wiping its content:
tooltipObject.ClearTooltip()

- If the tooltip is placed in the world, set where the tooltip is placed:
tooltipObject.SetWorldLocation (x, y, z)

- Screen location if not world positioned
tooltipObject.SetScreenLocation (x1, y1)

- If the tooltip will follow an entity
tooltipObject.SetFollowEntity (entityId, xOffSet, yOffSet, zOffSet)

- Following a bone of an entity
tooltipObject.SetFollowEntityBone (entityId, boneId, xOffSet, yOffSet, zOffSet)

- Set a table with CSS instructions for html <table>.
tooltipObject.SetTableCSS (tableCSS)

- Show the tooltip:
tooltipObject.ShowTooltip()

- Hide the tooltip:
tooltipObject.HideTooltip()

- Adds a new line into the tooltip:
tooltipObject.AddLine (leftText = "", rightText = "", colorNameLeft = "white", colorNameRight = "white", fontSize = 16, TRCSS = {}, TDCSS = {})

leftText: text.
rightText: text.
colorNameLeft: left text color, accept "red", "blue" or {1, 0, 0}, {0, 0, 1}.
colorNameRight:
fontSize: 
TRCSS: table with CSS instructions for html <tr>.
TDCSS: table with CSS instructions for html <td>.

- Add icons (into latest line added):
tooltipObject.AddIcon (leftImage, rightImage, imageWidth, imageHeight)

leftImage: left image url/path.
rightImage: right image url/path.
imageWidth: 
imageHeight: 

- Add progressbar (into latest line added):
tooltipObject.AddProgressBar (percent, colorName, isCentralized)

percent: percent filled.
colorName: accept "red", "blue" or {1, 0, 0}, {0, 0, 1}.
isCentralized: tooltip will attempt to use central alignment.

- Change progressbar percent:
tooltipObject.SetProgressBarPercent (lineId, newPercent, newColor)

lineId: which tooltip's line the progressbar is.
newPercent: percent.
newColor: accept "red", "blue" or {1, 0, 0}, {0, 0, 1}.

Example:
local tooltipObject = exports["np-tooltips"].GetTooltip()
tooltipObject.ClearTooltip()
tooltipObject.SetWorldLocation (-1749.659, -222.2369, 56.92052)
tooltipObject.AddLine ("Item Name:", "Gold Colar", "orange", "white", 16, {}, {"padding-top: 6px", "padding-bottom: 6px"})
tooltipObject.AddLine ("Price:", "1200", "orange", "white", 16, {}, {"width: 100", "padding-top: 10px", "padding-bottom: 2px", "font-style: italic", "text-align: center"})
tooltipObject.AddIcon (leftImage, [[https://i.imgur.com/G6EYfbN.png]], false, 100, 100)
tooltipObject.ShowTooltip()
