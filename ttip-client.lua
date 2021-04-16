
--regions
_G.tooltipObject = {}
local tooltipObject = _G.tooltipObject

--export the tooltip
exports("GetTooltip", function()
	return tooltipObject
end)

--np-toolbox
local npt

--local pointers
local tinsert = table.insert
local max = math.max
local unpack = table.unpack
local GetScreenCoordFromWorldCoord = GetScreenCoordFromWorldCoord

--cache
local tooltipIsShown = false

--line information from .AddLine
local tooltipLines = {}

--store css line information for <table> <tr> <td>
local tableCSS = {} -- <table>
local trCSS = {} -- <tr>
local tdCSS = {} -- <td>

--tooltip world location
local x, y, z
local followEntity
local followEntityBone

--when true the progress bar align in the center
local progressBarAlignCenter

--consts
local CONST_DEFAULT_COLOR = {255, 255, 255}

--tooltip functions
function tooltipObject.ClearTooltip()

	--tell js to clear tooltip
	SendNUIMessage (
		{
			type = "cleartooltip",
		}
	)

	tooltipObject.HideTooltip()

	--wipe settings and line content tables
	tooltipLines = {}

	--store css data for the tooltip <table>
	tableCSS = {}
	--store css data for each line of the tooltip 
	tdCSS = {}
	trCSS = {}
	
	--reset world location
	x, y, z = nil, nil, nil
	followEntity = nil
	followEntityBone = nil
	progressBarAlignCenter = nil
end


--font size in pixels
function tooltipObject.AddLine(leftText, rightText, colorNameLeft, colorNameRight, fontSize, thisTRCSS, thisTDCSS)
	--pull the color table rgba by the color name
	local leftColorTable = npt.ValidateColor(colorNameLeft or false, CONST_DEFAULT_COLOR)
	local rightColorTable = npt.ValidateColor(colorNameRight or false, CONST_DEFAULT_COLOR)

	--by default these color tables has alpha information, lets remove them 
	leftColorTable [4] = nil
	rightColorTable [4] = nil

	--add the css
	tinsert (tdCSS, thisTDCSS or {})
	tinsert (trCSS, thisTRCSS or {})

	tinsert (tooltipLines, {leftText or false, rightText or false, leftColorTable, rightColorTable, fontSize or 16})
end


--image size in pixels
function tooltipObject.AddIcon(leftImage, rightImage, imageWidth, imageHeight)
	local lastLine = tooltipLines [#tooltipLines]
	if (lastLine) then
		lastLine [6] = leftImage
		lastLine [7] = rightImage
		lastLine [8] = imageWidth
		lastLine [9] = imageHeight
	end
end


--add a status bar below the text and images
function tooltipObject.AddProgressBar(percent, colorName, isCentralized)
	local lastLine = tooltipLines [#tooltipLines]
	local colorTable = npt.ValidateColor(colorName or false, CONST_DEFAULT_COLOR)

	progressBarAlignCenter = isCentralized

	if (lastLine) then
		if (#lastLine == 5) then
			lastLine [6] = false
			lastLine [7] = false
			lastLine [8] = 0
			lastLine [9] = 0

			lastLine [10] = percent
			lastLine [11] = colorTable

		elseif (#lastLine == 9) then
			lastLine [10] = percent
			lastLine [11] = colorTable
		end
	end
end

--set where the tooltip is placed in the world
function tooltipObject.SetWorldLocation(x1, y1, z1)
	x, y, z = x1, y1, z1
end

--set there the tooltip is placed in the user screen
function tooltipObject.SetScreenLocation(x1, y1)
	x, y = x1, y1
	z = nil
end

--tooltip attach into the entity and follows it in the world
function tooltipObject.SetFollowEntity(entityId, xOffSet, yOffSet, zOffSet)
	xOffSet = xOffSet or 0
	yOffSet = yOffSet or 0
	zOffSet = zOffSet or 0

	x, y, z = xOffSet, yOffSet, zOffSet
	followEntity = entityId
end

--tooltip attach into a bone
function tooltipObject.SetFollowEntityBone(entityId, boneId, xOffSet, yOffSet, zOffSet)
	xOffSet = xOffSet or 0
	yOffSet = yOffSet or 0
	zOffSet = zOffSet or 0

	x, y, z = xOffSet, yOffSet, zOffSet

	followEntity = entityId
	followEntityBone = boneId
end

--adjust the progress of a progress bar
function tooltipObject.SetProgressBarPercent(lineId, newPercent, newColor)
	SendNUIMessage (
		{
			type = "updateprogressbar",
			line = lineId,
			percent = newPercent,
			color = newColor or tooltipLines [lineId] [11]
		}
	)
end

--change the text of a tooltip line
function tooltipObject.SetText(lineId, leftText, rightText)
	SendNUIMessage (
		{
			type = "updatetext",
			line = lineId,
			leftText = leftText,
			rightText = rightText
		}
	)
end

--when showing the tooltip in the world, update its location relative to the screen space
function tooltipObject.taskUpdateTooltip(deltaTime)

	local isOnScreen, screenX, screenY

	if (followEntityBone) then
		local bonePosition = GetPedBoneCoords (followEntity, followEntityBone)
		if (bonePosition) then
			local finalLocation = vector3 (x, y, z) + bonePosition
			isOnScreen, screenX, screenY = GetScreenCoordFromWorldCoord (unpack (finalLocation))
		end		

	elseif (followEntity) then
		local entityLoc = GetEntityCoords (followEntity)
		--local entityLoc = GetWorldPositionOfEntityBone (followEntity, 0x796E)
		if (entityLoc) then
			--add the offsets into the entity location
			local finalLocation = vector3 (x, y, z) + entityLoc
			isOnScreen, screenX, screenY = GetScreenCoordFromWorldCoord (unpack (finalLocation))
		end

	else
		isOnScreen, screenX, screenY = GetScreenCoordFromWorldCoord (x, y, z)
	end

	if (isOnScreen) then
		if (not tooltipIsShown) then
			tooltipObject.QuickShowTooltip()
		end
		
		SendNUIMessage (
			{
				type = "updatetooltipposition",
				x = screenX * 100,
				y = screenY * 100,
				progressbaraligncenter = progressBarAlignCenter,
			}
		)
	else
		if (tooltipIsShown) then
			tooltipObject.QuickHideTooltip()
		end
	end
end

--changes the tooltip location when anchored into the screen
function tooltipObject.updateTooltipScreenLocation()
	SendNUIMessage (
		{
			type = "updatetooltipposition",
			x = x * 100,
			y = y * 100,
			progressbaraligncenter = progressBarAlignCenter,
		}
	)
end

--send the lines to build the tooltip
local sendTooltipElements = function()
	for i = 1, #tooltipLines do
		SendNUIMessage (
			{
				type = "newtooltipline",
				line = tooltipLines[i],
				tdCSS = tdCSS[i],
				trCSS = trCSS[i],
				id = i,
			}
		)
	end
	
	--send a message telling all lines has been sent
	SendNUIMessage(
		{
			type = "alllinessent",
		}
	)
end

local updateTooltipStyle = function()
	SendNUIMessage(
		{
			type = "tooltipsetup",

			--table css contain data about the tooltip <table>, can have info about its size, etc
			tableCSS = tableCSS,
		}
	)

end


--set the css for the tooltip <table>, this css is send within the 'tooltipsetup' event
function tooltipObject.SetTableCSS(newTableCSS)
	tableCSS = newTableCSS
end

--show tooltip sending all the data needed to build the tooltip
function tooltipObject.ShowTooltip(hasFocus)
	
	if (hasFocus) then
		SetNuiFocus(hasFocus)
	end

	--send the tooltip style
	updateTooltipStyle()
	
	--send the lines of the tooltip
	sendTooltipElements()

	--send the message to show the tooltip
	tooltipObject.QuickShowTooltip()
	
	--start the update task to update the position in the screen
	if (followEntity) then
		npt.ResumeTask(tooltipObject.taskHandle)

	elseif (x and y and z) then
		npt.ResumeTask(tooltipObject.taskHandle)

	elseif (x and y) then
		tooltipObject.updateTooltipScreenLocation()
	end
end


--send a message to show the tooltip, this is used when the tooltip is hidden by the HideTooltip() function
function tooltipObject.QuickShowTooltip()
	SendNUIMessage(
		{
			type = "showtooltip",
		}
	)
	
	tooltipIsShown = true
end


--hide the tooltip
function tooltipObject.HideTooltip()
	SendNUIMessage(
		{
			type = "hidetooltip",
		}
	)

	tooltipIsShown = false
	
	npt.PauseTask(tooltipObject.taskHandle)
end


--send a message to just hide the tooltip <table>, no other action is done
function tooltipObject.QuickHideTooltip()
	SendNUIMessage(
		{
			type = "hidetooltip",
		}
	)

	tooltipIsShown = false
end


--initialize resource
Citizen.CreateThread(function()
	Wait (50)
	--get the toolbox
	npt = exports ["np-toolbox"]:GetNoPixelToolbox()

	--update tooltip on tick
	local taskHandle = npt.CreateTask (tooltipObject.taskUpdateTooltip, 1, false, false, false, false, "Update Tooltip")
	npt.PauseTask (taskHandle)
	tooltipObject.taskHandle = taskHandle
end)


--test case
function testTooltip()
	tooltipObject.ClearTooltip()

	tooltipObject.AddLine("0", "1")
	tooltipObject.AddLine("0", "1")
	tooltipObject.AddLine("0", "1")

	tooltipObject.ShowTooltip()

	local changeText = function()
		print("running...")
		tooltipObject.SetText(2, "PA", "32")
	end

	local taskHandle = npt.CreateTask(changeText, 2000, false, false, false, false, "Update Tooltip Text")
end

RegisterCommand("tooltipdebug", function(source, ...)
	testTooltip()
end)

