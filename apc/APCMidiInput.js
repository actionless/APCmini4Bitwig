// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

MidiInput.prototype.createNoteInput = function ()
{
    return this.createNoteInputBase ("Akai APC", [ "B040??" ]); // Sustainpedal
};
