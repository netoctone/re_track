Ext.ns('ReTrack');

ReTrack.MainHeader = Ext.apply(Ext.extend(Ext.Panel, {
  autoHeight: true,
  initComponent: function() {
    var initConfig = this.initialConfig;//maybe a better way exists

    var logoutToolbar = new Ext.Toolbar({
      items: [
        '->',
        {
          text: 'logout',
          handler: function() {
            location.href = 'logout';
          }
        }
      ]
    });
    
    var config = {
      items: [
        {
          xtype: 'toolbar',
          items: [
            '->',
            {
              text: 'work',
              toggleGroup: 'work-mode-selector',
              handler: function() {
                initConfig.listeners.modeSelect(ReTrack.MainHeader.WORK);
              }
            },
            {
              text: 'setup',
              toggleGroup: 'work-mode-selector',
              handler: function() {
                initConfig.listeners.modeSelect(ReTrack.MainHeader.SETUP);
              }
            }
          ]
        },
        logoutToolbar
      ]
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.MainHeader.superclass.initComponent.apply(this, arguments); 
  } // eo function initComponent
}),
{
  WORK: 're-track-main-header-work',
  SETUP: 're-track-main-header-setup'
});
