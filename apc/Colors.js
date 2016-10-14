// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// APC Colors for 5x8 clip matrix
var APC_COLOR_BLACK        = 0;   // off, 
var APC_COLOR_GREEN        = 1;   // green, 7-127 also green
var APC_COLOR_GREEN_BLINK  = 2;   // green blink, 
var APC_COLOR_RED          = 3;   // red, 
var APC_COLOR_RED_BLINK    = 4;   // red blink, 
var APC_COLOR_YELLOW       = 5;   // yellow, 
var APC_COLOR_YELLOW_BLINK = 6;   // yellow blink, 

Scales.SCALE_COLOR_OFF          = APC_COLOR_BLACK;
Scales.SCALE_COLOR_OCTAVE       = APC_COLOR_YELLOW;
Scales.SCALE_COLOR_NOTE         = APC_COLOR_BLACK;
Scales.SCALE_COLOR_OUT_OF_SCALE = APC_COLOR_BLACK;

AbstractSequencerView.COLOR_STEP_HILITE_NO_CONTENT = APC_COLOR_GREEN;
AbstractSequencerView.COLOR_STEP_HILITE_CONTENT    = APC_COLOR_GREEN;
AbstractSequencerView.COLOR_NO_CONTENT             = APC_COLOR_BLACK;
AbstractSequencerView.COLOR_CONTENT                = APC_COLOR_RED;
AbstractSequencerView.COLOR_CONTENT_CONT           = APC_COLOR_RED;
AbstractSequencerView.COLOR_MEASURE                = APC_COLOR_YELLOW;
AbstractSequencerView.COLOR_ACTIVE_MEASURE         = APC_COLOR_GREEN;

AbstractPlayView.COLOR_PLAY   = APC_COLOR_GREEN;
AbstractPlayView.COLOR_RECORD = APC_COLOR_RED;
AbstractPlayView.COLOR_OFF    = APC_COLOR_BLACK;

AbstractDrumView.COLOR_RECORD      = APC_COLOR_RED;
AbstractDrumView.COLOR_PLAY        = APC_COLOR_GREEN;
AbstractDrumView.COLOR_SELECTED    = APC_COLOR_YELLOW_BLINK;
AbstractDrumView.COLOR_MUTED       = APC_COLOR_YELLOW;
AbstractDrumView.COLOR_HAS_CONTENT = APC_COLOR_YELLOW;
AbstractDrumView.COLOR_NO_CONTENT  = APC_COLOR_BLACK;
