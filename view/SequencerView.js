// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

SequencerView.NUM_DISPLAY_ROWS = 8;
SequencerView.NUM_DISPLAY_COLS = 8;
SequencerView.NUM_OCTAVE       = 12;
SequencerView.START_KEY        = 36;

function SequencerView (model)
{
    AbstractSequencerView.call (this, model, 128, SequencerView.NUM_DISPLAY_COLS);
    this.offsetY = SequencerView.START_KEY;
    this.clip.scrollTo (0, SequencerView.START_KEY);
}
SequencerView.prototype = new AbstractSequencerView ();

SequencerView.prototype.onActivate = function ()
{
    this.updateScale ();
    AbstractSequencerView.prototype.onActivate.call (this);
};

SequencerView.prototype.updateArrows = function ()
{
    this.canScrollUp = this.offsetY + SequencerView.NUM_OCTAVE <= this.clip.getRowSize () - SequencerView.NUM_OCTAVE;
    this.canScrollDown = this.offsetY - SequencerView.NUM_OCTAVE >= 0;
    this.canScrollLeft = this.offsetX > 0;
    this.canScrollRight = true; // TODO We do not know the number of steps
};

SequencerView.prototype.updateNoteMapping = function ()
{
    AbstractSequencerView.prototype.updateNoteMapping.call (this);
    this.updateScale ();
};

SequencerView.prototype.updateScale = function ()
{
    this.noteMap = this.canSelectedTrackHoldNotes () ? this.scales.getSequencerMatrix (SequencerView.NUM_DISPLAY_ROWS, this.offsetY) : this.scales.getEmptyMatrix ();
};

SequencerView.prototype.onGridNote = function (note, velocity)
{
    if (this.surface.isShiftPressed ())
    {
        this.onShiftGridNote (note, velocity);
        return;
    }

    if (!this.canSelectedTrackHoldNotes ())
        return;
    if (velocity == 0)
        return;
    var index = note - 36;
    var x = index % 8;
    var y = Math.floor (index / 8);
    this.clip.toggleStep (x, this.noteMap[y], Config.accentActive ? Config.fixedAccentValue : velocity);
};

SequencerView.prototype.onSelectTrack = function (index, event)
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
            this.scrollDown (event);
            break;
        case 3:
            this.scrollUp (event);
            break;
    }
    this.updateScale ();
};

SequencerView.prototype.scrollUp = function (event)
{
    this.offsetY = Math.min (this.clip.getRowSize () - SequencerView.NUM_OCTAVE, this.offsetY + SequencerView.NUM_OCTAVE);
    this.updateScale ();
    displayNotification (this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[7]));
};

SequencerView.prototype.scrollDown = function (event)
{
    this.offsetY = Math.max (0, this.offsetY - SequencerView.NUM_OCTAVE);
    this.updateScale ();
    displayNotification (this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[7]));
};

SequencerView.prototype.drawGrid = function ()
{
    if (this.surface.isShiftPressed ())
    {
        this.drawShiftGrid ();
        return;
    }
    
    var isKeyboardEnabled = this.canSelectedTrackHoldNotes ();

    var step = this.clip.getCurrentStep ();
    var hiStep = this.isInXRange (step) ? step % SequencerView.NUM_DISPLAY_COLS : -1;
    for (var x = 0; x < SequencerView.NUM_DISPLAY_COLS; x++)
    {
        for (var y = 0; y < SequencerView.NUM_DISPLAY_ROWS; y++)
        {
            var row = this.noteMap[y];
            var isSet = this.clip.getStep (x, row);
            var hilite = x == hiStep;
            if (isKeyboardEnabled)
                this.surface.pads.lightEx (x, y, isSet ? (hilite ? APC_COLOR_GREEN : APC_COLOR_RED) : hilite ? APC_COLOR_GREEN : this.scales.getColor (this.noteMap, y));
            else
                this.surface.pads.lightEx (x, y, APC_COLOR_BLACK);
        }
    }
    
    this.drawSceneButtons ();
};
