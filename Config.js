// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2015-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

load ("framework/core/AbstractConfig.js");

// ------------------------------
// Static configurations
// ------------------------------

// Inc/Dec of knobs
Config.fractionValue     = 1;
Config.fractionMinValue  = 0.5;
Config.maxParameterValue = 128;

// How fast the track and scene arrows scroll the banks/scenes
Config.trackScrollInterval = 100;
Config.sceneScrollInterval = 100;


// ------------------------------
// Editable configurations
// ------------------------------

Config.FADER_CTRL = 20;
Config.SOFT_KEYS  = 21;

Config.FADER_CTRL_OPTIONS = [ "Volume", "Pan", "Send 1", "Send 2", "Send 3", "Send 4", "Send 5", "Send 6", "Send 7", "Send 8", "Device", "Macros" ];
Config.SOFT_KEYS_OPTIONS  = [ "Clip Stop", "Solo", "Rec Arm", "Mute", "Select" ];

Config.faderCtrl = Config.FADER_CTRL_OPTIONS[0];
Config.softKeys  = Config.SOFT_KEYS_OPTIONS[0];

Config.initListeners (Config.SOFT_KEYS);


Config.init = function ()
{
    var prefs = host.getPreferences ();

    ///////////////////////////
    // Scale

    Config.activateScaleSetting (prefs);
    Config.activateScaleBaseSetting (prefs);
    Config.activateScaleInScaleSetting (prefs);
    Config.activateScaleLayoutSetting (prefs);

    ///////////////////////////
    // Play and Sequencer

    Config.activateQuantizeAmountSetting (prefs);

    ///////////////////////////
    // Workflow

    Config.activateBehaviourOnStopSetting (prefs);
    Config.activateSelectClipOnLaunchSetting (prefs);
    
    ///////////////////////////
    // Button Control

    Config.faderCtrlSetting = prefs.getEnumSetting ("Fader Ctrl", "Button Control", Config.FADER_CTRL_OPTIONS, Config.FADER_CTRL_OPTIONS[0]);
    Config.faderCtrlSetting.addValueObserver (function (value)
    {
        Config.faderCtrl = value;
        Config.notifyListeners (Config.FADER_CTRL);
    });

    Config.softKeysSetting = prefs.getEnumSetting ("Soft Keys", "Button Control", Config.SOFT_KEYS_OPTIONS, Config.SOFT_KEYS_OPTIONS[0]);
    Config.softKeysSetting.addValueObserver (function (value)
    {
        Config.softKeys = value;
        Config.notifyListeners (Config.SOFT_KEYS);
    });
};

Config.setFaderCtrl = function (faderCtrl)
{
    Config.faderCtrlSetting.set (faderCtrl);
};

Config.setSoftKeys = function (softKeys)
{
    Config.softKeysSetting.set (softKeys);
};
