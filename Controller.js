// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Controller ()
{
    Config.init ();

    this.scales = new Scales (36, 100, 8, 8);
    this.model = new Model (null, this.scales, 8, 8, 8, 6, 16, 16, true);
    
    this.model.getTrackBank ().addTrackSelectionListener (doObject (this, Controller.prototype.handleTrackChange));
    
    var output = new MidiOutput ();
    var input = new MidiInput ();
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
    
    Config.addPropertyListener (Config.SCALES_SCALE, doObject (this, function ()
    {
        this.scales.setScaleByName (Config.scale);
        this.surface.getActiveView ().updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.SCALES_BASE, doObject (this, function ()
    {
        this.scales.setScaleOffsetByName (Config.scaleBase);
        this.surface.getActiveView ().updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.SCALES_IN_KEY, doObject (this, function ()
    {
        this.scales.setChromatic (!Config.scaleInKey);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.SCALES_LAYOUT, doObject (this, function ()
    {
        this.scales.setScaleLayoutByName (Config.scaleLayout);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.FADER_CTRL, doObject (this, function ()
    {
        switch (Config.faderCtrl)
        {
            case 'Volume':
                this.surface.setPendingMode (MODE_VOLUME);
                break;
            case 'Pan':
                this.surface.setPendingMode (MODE_PAN);
                break;
            case 'Send 1': 
                this.surface.setPendingMode (MODE_SEND1);
                break;
            case 'Send 2': 
                this.surface.setPendingMode (MODE_SEND2);
                break;
            case 'Send 3': 
                this.surface.setPendingMode (MODE_SEND3);
                break;
            case 'Send 4': 
                this.surface.setPendingMode (MODE_SEND4);
                break;
            case 'Send 5': 
                this.surface.setPendingMode (MODE_SEND5);
                break;
            case 'Send 6': 
                this.surface.setPendingMode (MODE_SEND6);
                break;
            case 'Send 7': 
                this.surface.setPendingMode (MODE_SEND7);
                break;
            case 'Send 8': 
                this.surface.setPendingMode (MODE_SEND8);
                break;
            case 'Device': 
                this.surface.setPendingMode (MODE_DEVICE);
                break;
            case 'Macros':
                this.surface.setPendingMode (MODE_MACRO);
                break;
        }
    }));
    Config.addPropertyListener (Config.SOFT_KEYS, doObject (this, function ()
    {
        for (var i = 0; i < Config.SOFT_KEYS_OPTIONS.length; i++)
        {
            if (Config.SOFT_KEYS_OPTIONS[i] == Config.softKeys)
                AbstractView.trackState = i;
        }
    }));

    this.surface.addView (VIEW_PLAY, new PlayView (this.model));
    this.surface.addView (VIEW_SESSION, new SessionView (this.model));
    this.surface.addView (VIEW_SEQUENCER, new SequencerView (this.model));
    this.surface.addView (VIEW_DRUM, new DrumView (this.model));
    this.surface.addView (VIEW_RAINDROPS, new RaindropsView (this.model));
    this.surface.addView (VIEW_SHIFT, new ShiftView (this.model));
    
    this.surface.setActiveView (VIEW_SESSION);
    this.surface.setPendingMode (MODE_VOLUME);
}
Controller.prototype = new AbstractController ();

Controller.prototype.flush = function ()
{
    AbstractController.prototype.flush.call (this);
    this.updateMode (this.surface.getCurrentMode ());
};

Controller.prototype.updateMode = function (mode)
{
    this.updateIndication (mode);
};

Controller.prototype.updateIndication = function (mode)
{
    var tb = this.model.getCurrentTrackBank ();
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

Controller.prototype.handleTrackChange = function (index, isSelected)
{
    if (!isSelected)
        return;

    if (this.surface.isActiveView (VIEW_PLAY))
        this.surface.getActiveView ().updateNoteMapping ();
};
