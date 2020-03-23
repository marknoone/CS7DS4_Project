/*
    TODO: Explination Of Operation:
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Maecenas ut sagittis massa, vel pellentesque ligula. Duis 
    sapien ipsum, sollicitudin et imperdiet et, convallis non 
    massa. In luctus facilisis mattis. Etiam eu euismod dolor, 
    vitae molestie orci. Praesent eget suscipit libero. Etiam 
    elementum molestie enim. Donec faucibus est sit amet varius 
    placerat. Cras leo lacus, maximus vitae scelerisque quis, 
    tempor viverra arcu. Aenean tempus efficitur facilisis. 
    Maecenas eget diam quis nisi sagittis commodo. Curabitur 
    viverra ipsum ut sapien ullamcorper, a pellentesque nisl 
    rhoncus. Suspendisse non sem iaculis, tempus dolor sed, 
    luctus quam. Curabitur blandit risus ut nunc porttitor 
    hendrerit. In dignissim turpis ullamcorper, dapibus lorem 
    ut, tincidunt augue. 
*/

// Global State & Parsing
var gs = new GlobalState()
gs.SetDataManager(new DataManager(gs));
gs.GetDataManager().ParseGTFS("LUAS", () => {
    console.log(gs.GetDataManager().stops[this.gs.GetActiveStopID()]);
    console.log(gs.GetDataManager().chartData[this.gs.GetActiveStopID()]);
    
    // Set up remaining managers.
    gs.SetChartManager(new ChartManager(gs));
    gs.SetMapManager(new MapManager(gs));
    gs.SetNetworkGraph(new NetworkGraph(gs));
    gs.SetUI(new UIManager(gs));
    
    // Begin simulation
    gs.Update();
    gs.ClearTimeout(); // TODO: Remove for simulation to be continued.
});
