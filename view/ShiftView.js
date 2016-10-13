// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2015-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

ShiftView.TRANSLATE = [ 0, 2, 4, 6, 1, 3, 5, -1, -1, 10, 8, -1, 11, 9, 7, -1 ];


function ShiftView (model)
{
    if (model == null)
        return;
    
    AbstractView.call (this, model);
}
ShiftView.prototype = new AbstractView ();

ShiftView.prototype.drawGrid = function ()
{
    // Draw the keyboard
    var scaleOffset = this.model.getScales ().getScaleOffset ();
    // 0'C', 1'G', 2'D', 3'A', 4'E', 5'B', 6'F', 7'Bb', 8'Eb', 9'Ab', 10'Db', 11'Gb'
    for (var i = 7; i < 64; i++)
        this.surface.pads.light (36 + i, APC_COLOR_BLACK);
    this.surface.pads.light (36 + 0, scaleOffset == 0 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 1, scaleOffset == 2 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 2, scaleOffset == 4 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 3, scaleOffset == 6 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 4, scaleOffset == 1 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 5, scaleOffset == 3 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 6, scaleOffset == 5 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 9, scaleOffset == 10 ? APC_COLOR_GREEN : APC_COLOR_RED);
    this.surface.pads.light (36 + 10, scaleOffset == 8 ? APC_COLOR_GREEN : APC_COLOR_RED);
    this.surface.pads.light (36 + 12, scaleOffset == 11 ? APC_COLOR_GREEN : APC_COLOR_RED);
    this.surface.pads.light (36 + 13, scaleOffset == 9 ? APC_COLOR_GREEN : APC_COLOR_RED);
    this.surface.pads.light (36 + 14, scaleOffset == 7 ? APC_COLOR_GREEN : APC_COLOR_RED);

    // Device Parameters up/down
    this.surface.pads.light (36 + 24, APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 25, APC_COLOR_YELLOW);
    // Device up/down
    this.surface.pads.light (36 + 32, APC_COLOR_GREEN);
    this.surface.pads.light (36 + 33, APC_COLOR_GREEN);
    
    // Draw the view selection: Session, Note, Drum, Sequencer
    this.surface.pads.light (36 + 56, this.surface.previousViewId == VIEW_SESSION   ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 57, this.surface.previousViewId == VIEW_PLAY      ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 58, this.surface.previousViewId == VIEW_DRUM      ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 59, this.surface.previousViewId == VIEW_SEQUENCER ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 60, this.surface.previousViewId == VIEW_RAINDROPS ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    
    // Draw transport
    var transport = this.model.getTransport ();
    this.surface.pads.light (36 + 63, transport.isPlaying ? APC_COLOR_GREEN_BLINK : APC_COLOR_GREEN);
    this.surface.pads.light (36 + 55, transport.isRecording ? APC_COLOR_RED_BLINK : APC_COLOR_RED);
    this.surface.pads.light (36 + 47, APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 39, APC_COLOR_YELLOW);
    
    this.surface.pads.light (36 + 62, APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 54, transport.isLauncherOverdub ? APC_COLOR_RED_BLINK : APC_COLOR_RED);
    this.surface.pads.light (36 + 46, APC_COLOR_YELLOW);
    this.surface.pads.light (36 + 38, APC_COLOR_YELLOW);
};

ShiftView.prototype.onGridNote = function (note, velocity)
{
    if (velocity == 0)
        return;

    var index = note - 36;
    switch (index)
    {
        // Flip views
        case 56:
            this.surface.previousViewId = VIEW_SESSION;
            displayNotification ("Session");
            break;
        case 57: 
            this.surface.previousViewId = VIEW_PLAY;
            displayNotification ("Play");
            break;
        case 58:
            this.surface.previousViewId = VIEW_DRUM;
            displayNotification ("Drum");
            break;
        case 59:
            this.surface.previousViewId = VIEW_SEQUENCER;
            displayNotification ("Sequencer");
            break;
        case 60:
            this.surface.previousViewId = VIEW_RAINDROPS;
            displayNotification ("Raindrops");
            break;

        // Last row transport
        case 63:
            this.handlePlayOptions ();
            displayNotification ("Start/Stop");
            break;
        case 55:
            this.model.getTransport ().record ();
            displayNotification ("Record");
            break;
        case 47:
            this.model.getTransport ().toggleLoop ();
            displayNotification ("Toggle Loop");
            break;
        case 39:
            this.model.getTransport ().toggleClick ();
            displayNotification ("Toggle Click");
            break;

        // Navigation
        case 62:
            this.onNew ();
            displayNotification ("New clip");
            break;
        case 54:
            this.model.getTransport ().toggleLauncherOverdub ();
            displayNotification ("Toggle Launcher Overdub");
            break;
        case 46:
            // We can use any cursor clip, e.g. the one of the drum view
            var view = this.surface.getView (VIEW_DRUM);
            view.clip.quantize (Config.quantizeAmount / 100);
            displayNotification ("Quantize");
            break;
        case 38:
            this.model.getApplication ().undo ();
            displayNotification ("Undo");
            break;
            
        // Device Parameters up/down
        case 24:
            this.model.getCursorDevice ().previousParameterPage ();
            displayNotification ("Previous Parameter Page");
            break;
        case 25:
            this.model.getCursorDevice ().nextParameterPage ();
            displayNotification ("Next Parameter Page");
            break;

        // Device up/down
        case 32:
            this.model.getCursorDevice ().selectPrevious ();
            displayNotification ("Previous Device");
            break;
        case 33:
            this.model.getCursorDevice ().selectNext ();
            displayNotification ("Next Device");
            break;
            
        // Scale Base note selection
        default:
            if (index > 15)
                return;
            var pos = AbstractView.TRANSLATE[index];
            if (pos == -1)
                return;
            this.model.getScales ().setScaleOffset (pos);
            Config.setScaleBase (Scales.BASES[pos]);
            displayNotification (Scales.BASES[pos]);
            this.surface.getActiveView ().updateNoteMapping ();
            break;
    }
};

ShiftView.prototype.onScene = function (index, event)
{
    if (!event.isDown ())
        return;
    switch (index)
    {
        case 5:
            this.model.toggleCurrentTrackBank ();
            var isEffectTrackBank = this.model.isEffectTrackBankActive ();
            if (isEffectTrackBank)
            {
                // No Sends on effect tracks
                var mode = this.surface.getCurrentMode ();
                if (mode >= MODE_SEND1 && mode <= MODE_SEND8)
                    this.surface.setPendingMode (MODE_VOLUME);
            }
            displayNotification (isEffectTrackBank ? "Effect Tracks" : "Instrument/Audio Tracks");
            break;
        case 6:
            this.model.getCursorDevice ().toggleWindowOpen ();
            break;
        case 7:
            this.model.getCurrentTrackBank ().getClipLauncherScenes ().stop ();
            break;
        default:
            AbstractView.trackState = index;
            Config.setSoftKeys (Config.SOFT_KEYS_OPTIONS[index]);
            displayNotification (Config.SOFT_KEYS_OPTIONS[index]);
            break;
    }
};


ShiftView.prototype.onSelectTrack = function (index, event)
{
    if (!event.isDown ())
        return;
        
    switch (index)
    {
        case 0:
            this.onLeft (event);
            break;
        case 1:
            this.onRight (event);
            break;
        case 2:
            this.onUp (event);
            break;
        case 3:
            this.onDown (event);
            break;
    
    
        case 4:
            this.surface.setPendingMode (MODE_VOLUME);
            Config.setFaderCtrl ("Volume");
            displayNotification ("Volume");
            break;

        case 5:
            this.surface.setPendingMode (MODE_PAN);
            Config.setFaderCtrl ("Pan");
            displayNotification ("Pan");
            break;

        case 6:
            if (this.model.isEffectTrackBankActive ())
                return;
            var mode = this.surface.getCurrentMode () + 1;
            // Wrap
            if (mode < MODE_SEND1 || mode > MODE_SEND8)
                mode = MODE_SEND1;
            // Check if Send channel exists
            var fxTrackBank = this.model.getEffectTrackBank ();
            if (mode >= MODE_SEND1 && mode <= MODE_SEND8 && (fxTrackBank != null && !fxTrackBank.getTrack (mode - MODE_SEND1).exists))
                mode = MODE_SEND1;
            this.surface.setPendingMode (mode);
            var name = "Send " + (mode - MODE_SEND1 + 1);
            Config.setFaderCtrl (name);
            displayNotification (name);
            break;

        case 7:
            if (this.surface.getCurrentMode () == MODE_DEVICE)
            {
                this.surface.setPendingMode (MODE_MACRO);
                Config.setFaderCtrl ("Macro");
                displayNotification ("Macro");
            }
            else
            {
                this.surface.setPendingMode (MODE_DEVICE);
                Config.setFaderCtrl ("Device");
                displayNotification ("Device");
            }
            break;
    }
}

ShiftView.prototype.updateArrowStates = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    this.canScrollUp    = tb.canScrollScenesUp ();
    this.canScrollDown  = tb.canScrollScenesDown ();
    this.canScrollLeft  = tb.canScrollTracksUp ();
    this.canScrollRight = tb.canScrollTracksDown ();
};

ShiftView.prototype.updateSceneButtons = function ()
{
    var view = this.surface.getActiveView ();
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1, view.canScrollUp ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON2, view.canScrollDown ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON3, view.canScrollLeft ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON4, view.canScrollRight ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    
    var mode = this.surface.getCurrentMode ();
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON5, mode == MODE_VOLUME ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON6, mode == MODE_PAN ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON7, mode >= MODE_SEND1 && mode <= MODE_SEND8 ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON8, mode == MODE_DEVICE || mode == MODE_MACRO ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);


    // Draw the track states on the scene buttons
    this.surface.updateButton (APC_BUTTON_SCENE_BUTTON1, AbstractView.trackState == TRACK_STATE_CLIP_STOP ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_SCENE_BUTTON2, AbstractView.trackState == TRACK_STATE_SOLO ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_SCENE_BUTTON3, AbstractView.trackState == TRACK_STATE_REC_ARM ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_SCENE_BUTTON4, AbstractView.trackState == TRACK_STATE_MUTE ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_SCENE_BUTTON5, AbstractView.trackState == TRACK_STATE_SELECT ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_SCENE_BUTTON6, this.model.isEffectTrackBankActive () ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_SCENE_BUTTON7, APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_SCENE_BUTTON8, APC_BUTTON_STATE_OFF);
};
