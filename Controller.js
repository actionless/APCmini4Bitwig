// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Controller ()
{
    var output = new MidiOutput ();
    var input = new APCMidiInput ();
    input.init ();
    
    var scales = new Scales (36, 100, 8, 8);
    this.model = new Model (null, scales, 8, 8, 8);
    this.model.getTrackBank ().addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        if (this.surface.isActiveView (VIEW_PLAY))
            this.surface.getActiveView ().updateNoteMapping ();
    }));
    
    this.surface = new APC (output, input);
    this.surface.setDefaultMode (MODE_VOLUME);

    this.surface.addMode (MODE_VOLUME, new VolumeMode (this.model));
    this.surface.addMode (MODE_PAN, new PanMode (this.model));
    for (var i = 0; i < 8; i++)
        this.surface.addMode (MODE_SEND1 + i, new SendMode (this.model, i));
    this.surface.addMode (MODE_DEVICE, new DeviceMode (this.model));
    this.surface.addMode (MODE_MACRO, new MacroMode (this.model));

    this.surface.addModeListener (doObject (this, function (oldMode, newMode)
    {
        this.updateMode (-1);
        this.updateMode (newMode);
    }));
    

    this.surface.addView (VIEW_PLAY, new PlayView (this.model));
    this.surface.addView (VIEW_SESSION, new SessionView (this.model));
    this.surface.addView (VIEW_SEQUENCER, new SequencerView (this.model));
    this.surface.addView (VIEW_DRUM, new DrumView (this.model));
    
    this.surface.setActiveView (VIEW_SESSION);
    this.surface.setPendingMode (MODE_VOLUME);
}
Controller.prototype = new AbstractController ();

Controller.prototype.flush = function ()
{
    AbstractController.prototype.flush.call (this);
    
    var mode = this.surface.getCurrentMode ();
    this.updateMode (mode);

    var view = this.surface.getActiveView ();
    if (this.surface.isShiftPressed ())
    {
        this.surface.setButton (APC_BUTTON_TRACK_BUTTON1, view.canScrollUp ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
        this.surface.setButton (APC_BUTTON_TRACK_BUTTON2, view.canScrollDown ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
        this.surface.setButton (APC_BUTTON_TRACK_BUTTON3, view.canScrollLeft ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
        this.surface.setButton (APC_BUTTON_TRACK_BUTTON4, view.canScrollRight ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
        
        this.surface.setButton (APC_BUTTON_TRACK_BUTTON5, mode == MODE_VOLUME ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
        this.surface.setButton (APC_BUTTON_TRACK_BUTTON6, mode == MODE_PAN ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
        this.surface.setButton (APC_BUTTON_TRACK_BUTTON7, mode >= MODE_SEND1 && mode <= MODE_SEND8 ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
        this.surface.setButton (APC_BUTTON_TRACK_BUTTON8, mode == MODE_DEVICE || mode == MODE_MACRO ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    }
};

Controller.prototype.updateMode = function (mode)
{
    this.updateIndication (mode);
};

Controller.prototype.updateIndication = function (mode)
{
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    for (var i = 0; i < 8; i++)
    {
        tb.setVolumeIndication (i, mode == MODE_VOLUME);
        tb.setPanIndication (i, mode == MODE_PAN);
        for (var j = 0; j < 8; j++)
        {
            tb.setSendIndication (i, j, mode == MODE_SEND1 && j == 0 ||
                                        mode == MODE_SEND2 && j == 1 ||
                                        mode == MODE_SEND3 && j == 2 ||
                                        mode == MODE_SEND4 && j == 3 ||
                                        mode == MODE_SEND5 && j == 4 ||
                                        mode == MODE_SEND6 && j == 5 ||
                                        mode == MODE_SEND7 && j == 6 ||
                                        mode == MODE_SEND8 && j == 7);
        }

        var cd = this.model.getCursorDevice ();
        cd.getParameter (i).setIndication (mode == MODE_DEVICE);
        cd.getMacro (i).getAmount ().setIndication (mode == MODE_MACRO);
    }
};