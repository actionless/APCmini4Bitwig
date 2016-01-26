// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PlayView (model)
{
    AbstractView.call (this, model);
    this.scales = model.getScales ();
    this.noteMap = this.scales.getEmptyMatrix ();
    this.pressedKeys = initArray (0, 128);
    this.defaultVelocity = [];
    for (var i = 0; i < 128; i++)
        this.defaultVelocity.push (i);
    var tb = model.getTrackBank ();
    tb.addNoteListener (doObject (this, function (pressed, note, velocity)
    {
        // Light notes send from the sequencer
        for (var i = 0; i < 128; i++)
        {
            if (this.noteMap[i] == note)
                this.pressedKeys[i] = pressed ? velocity : 0;
        }
    }));
    tb.addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        this.clearPressedKeys ();
    }));

    this.scrollerInterval = Config.trackScrollInterval;
}
PlayView.prototype = new AbstractView ();

PlayView.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);

    this.model.getCurrentTrackBank ().setIndication (true);
    this.initMaxVelocity ();
};

PlayView.prototype.updateArrows = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    this.canScrollUp = tb.canScrollTracksUp ();
    this.canScrollDown = tb.canScrollTracksDown ();
    this.canScrollLeft = tb.canScrollScenesUp ();
    this.canScrollRight = tb.canScrollScenesDown ();
};

PlayView.prototype.updateNoteMapping = function ()
{
    this.noteMap = this.canSelectedTrackHoldNotes () ? this.scales.getNoteMatrix () : this.scales.getEmptyMatrix ();
    // Workaround: https://github.com/git-moss/Push4Bitwig/issues/7
    scheduleTask (doObject (this, function () { this.surface.setKeyTranslationTable (this.noteMap); }), null, 100);
};

PlayView.prototype.drawGrid = function ()
{
    if (this.surface.isShiftPressed ())
    {
        this.drawShiftGrid ();
        return;
    }

    var isKeyboardEnabled = this.canSelectedTrackHoldNotes ();
    var isRecording = this.model.hasRecordingState ();
    for (var i = 36; i < 100; i++)
    {
        this.surface.pads.light (i - 36, isKeyboardEnabled ? (this.pressedKeys[i] > 0 ?
            (isRecording ? APC_COLOR_RED : APC_COLOR_GREEN) :
            this.scales.getColor (this.noteMap, i)) : APC_COLOR_BLACK);
    }

    this.drawSceneButtons ();
};

PlayView.prototype.drawSceneButtons = function ()
{
    for (var i = 0; i < 8; i++)
    {
        this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + i, APC_BUTTON_STATE_OFF);
        this.surface.updateButton (APC_BUTTON_SCENE_BUTTON1 + i, i == 2 ? APC_BUTTON_STATE_OFF : APC_BUTTON_STATE_ON);
    }
};

PlayView.prototype.onScene = function (scene, event)
{
    if (this.surface.isShiftPressed ())
    {
        this.onShiftScene (scene, event);
        return;
    }

    if (!event.isDown ())
        return;
    if (!this.canSelectedTrackHoldNotes ())
        return;
    switch (scene)
    {
        case 0:
            this.scales.setScaleLayout (this.scales.getScaleLayout () + 1);
            this.updateNoteMapping ();
            var name = Scales.LAYOUT_NAMES[this.scales.getScaleLayout ()];
            Config.setScaleLayout (name);
            displayNotification (name);
            break;
        case 1:
            this.scales.setScaleLayout (this.scales.getScaleLayout () - 1);
            this.updateNoteMapping ();
            var name = Scales.LAYOUT_NAMES[this.scales.getScaleLayout ()];
            Config.setScaleLayout (name);
            displayNotification (name);
            break;
        case 3:
            this.scales.prevScale ();
            Config.setScale (this.scales.getName (this.scales.getSelectedScale ()));
            displayNotification (this.scales.getName (this.scales.getSelectedScale ()));
            break;
        case 4:
            this.scales.nextScale ();
            Config.setScale (this.scales.getName (this.scales.getSelectedScale ()));
            displayNotification (this.scales.getName (this.scales.getSelectedScale ()));
            break;
		case 5:
			this.scales.toggleChromatic ();
			var isChromatic = this.scales.isChromatic ();
			Config.setScaleInScale (!isChromatic);
            displayNotification (isChromatic ? "Chromatic" : "In Key");
			break;
		case 6:
            this.clearPressedKeys ();
            this.scales.incOctave ();
            this.updateNoteMapping ();
            displayNotification (this.scales.getRangeText ());
            break;
		case 7:
            this.clearPressedKeys ();
            this.scales.decOctave ();
            this.updateNoteMapping ();
            displayNotification (this.scales.getRangeText ());
            break;
    }
    this.updateNoteMapping ();
};

PlayView.prototype.onGridNote = function (note, velocity)
{
    if (this.surface.isShiftPressed ())
    {
        this.onShiftGridNote (note, velocity);
        return;
    }

    if (!this.canSelectedTrackHoldNotes ())
        return;
        
    this.surface.sendMidiEvent (0x90, this.noteMap[note], velocity);
        
    // Mark selected notes
    for (var i = 0; i < 128; i++)
    {
        if (this.noteMap[note] == this.noteMap[i])
            this.pressedKeys[i] = velocity;
    }
};

PlayView.prototype.onSelectTrack = function (index, event)
{
    if (this.surface.isShiftPressed ())
    {
        AbstractView.prototype.onSelectTrack.call (this, index, event);
        return;
    }
    
    if (!event.isDown ())
        return;
        
    switch (index)
    {
        case 0:
            this.scales.prevScale ();
            Config.setScale (this.scales.getName (this.scales.getSelectedScale ()));
            displayNotification (this.scales.getName (this.scales.getSelectedScale ()));
            break;
        case 1:
            this.scales.nextScale ();
            Config.setScale (this.scales.getName (this.scales.getSelectedScale ()));
            displayNotification (this.scales.getName (this.scales.getSelectedScale ()));
            break;
        case 2:
            this.onOctaveDown (event);
            break;
        case 3:
            this.onOctaveUp (event);
            break;
    }
    this.updateNoteMapping ();
};

PlayView.prototype.onOctaveDown = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.decOctave ();
    displayNotification (this.scales.getRangeText ());
};

PlayView.prototype.onOctaveUp = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.incOctave ();
    displayNotification (this.scales.getRangeText ());
};

PlayView.prototype.onAccent = function (event)
{
    AbstractView.prototype.onAccent.call (this, event);
    if (event.isUp ())
        this.initMaxVelocity ();
};

PlayView.prototype.initMaxVelocity = function ()
{
    this.maxVelocity = initArray (Config.fixedAccentValue, 128);
    this.maxVelocity[0] = 0;
    this.surface.setVelocityTranslationTable (Config.accentActive ? this.maxVelocity : this.defaultVelocity);
};

PlayView.prototype.clearPressedKeys = function ()
{
    for (var i = 0; i < 128; i++)
        this.pressedKeys[i] = 0;
};