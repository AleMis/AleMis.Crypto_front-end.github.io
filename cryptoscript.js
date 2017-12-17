var candleRequest, booksRequest, currencyPairToShow;
firstDeployRequest();
firstDeployCurrencyPair();

function firstDeployRequest() {
  candleRequest = 'http://localhost:8080/v1/crypto/getCandles?currencyPair=tBTCUSD&timeFrame=1D';
  booksRequest = 'http://localhost:8080/v1/crypto/getBooks?currencyPair=tBTCUSD'
}

function firstDeployCurrencyPair() {
  currencyPairToShow = candleRequest.substr(57,6);
}


var candleChart =	AmCharts.makeChart("candlechart", {
				type: "stock",
        categoryAxesSettings: {
          minPeriod: "DD"
        },
				dataSets: [{
					fieldMappings: [{
						fromField: "open",
						toField: "open"
					}, {
						fromField: "close",
						toField: "close"
					}, {
						fromField: "high",
						toField: "high"
					}, {
						fromField: "low",
						toField: "low"
					}, {
						fromField: "volume",
						toField: "volume"
					}, {
						fromField: "value",
						toField: "value"
					}],

					color: "#7f8da9",
					dataLoader: {
      			url: candleRequest,
      			format: 'json'
    			},
					title: currencyPairToShow,
					categoryField: "date"
				}],


				panels: [{
						title: "Value",
						showCategoryAxis: false,
						percentHeight: 70,
						valueAxes: [{
							id:"v1",
							dashLength: 5
						}],

						categoryAxis: {
							dashLength: 5
						},

						stockGraphs: [{
							type: "candlestick",
							id: "g1",
							openField: "open",
							closeField: "close",
							highField: "high",
							lowField: "low",
							valueField: "close",
							lineColor: "#7f8da9",
							fillColors: "#7f8da9",
							negativeLineColor: "#db4c3c",
							negativeFillColors: "#db4c3c",
							fillAlphas: 1,
							useDataSetColors: false,
							comparable: true,
							compareField: "value",
							showBalloon: false
						}],

						stockLegend: {
							valueTextRegular: undefined,
							periodValueTextComparing: "[[percents.value.close]]%"
						}
					},

					{
						title: "Volume",
						percentHeight: 30,
						marginTop: 1,
						showCategoryAxis: true,
						valueAxes: [{
							id:"v2",
							dashLength: 5
						}],

						categoryAxis: {
							dashLength: 5
						},

						stockGraphs: [{
							valueField: "volume",
							type: "column",
							showBalloon: false,
							fillAlphas: 1
						}],

						stockLegend: {
							markerType: "none",
							markerSize: 0,
							labelText: "",
							periodValueTextRegular: "[[value.close]]"
						}
					}
				],

				chartCursorSettings: {
					valueLineEnabled:true,
					valueLineBalloonEnabled:true
				},


				chartScrollbarSettings: {
					graph: "g1",
					graphType: "line",
					usePeriod: "WW",
					updateOnReleaseOnly:false
				},

				periodSelector: {
					position: "bottom",
					periods: [{
						period: "DD",
						count: 10,
						label: "10 days"
					}, {
						period: "MM",
						selected: true,
						count: 1,
						label: "1 month"
					}, {
						period: "YYYY",
						count: 1,
						label: "1 year"
					}, {
						period: "YTD",
						label: "YTD"
					}, {
						period: "MAX",
						label: "MAX"
					}]
				}
			});

var orderBookChart = AmCharts.makeChart("orderbookchart", {
  type: "serial",
  theme: "light",
  dataLoader: {
    url: booksRequest,
    format: "json",
    reload: 15,
    postProcess: function(data) {

      // Function to process (sort and calculate cummulative volume)
      function processData(list, type, desc) {

        // Convert to data points
        for(var i = 0; i < list.length; i++) {
          list[i] = {
            value: Number(list[i][0]),
            volume: Number(list[i][1]),
          }
        }

        // Sort list just in case
        list.sort(function(a, b) {
          if (a.value > b.value) {
            return 1;
          }
          else if (a.value < b.value) {
            return -1;
          }
          else {
            return 0;
          }
        });

        // Calculate cummulative volume
        if (desc) {
          for(var i = list.length - 1; i >= 0; i--) {
            if (i < (list.length - 1)) {
              list[i].totalvolume = list[i+1].totalvolume + list[i].volume;
            }
            else {
              list[i].totalvolume = list[i].volume;
            }
            var dp = {};
            dp["value"] = list[i].value;
            dp[type + "volume"] = list[i].volume;
            dp[type + "totalvolume"] = list[i].totalvolume;
            res.unshift(dp);
          }
        }
        else {
          for(var i = 0; i < list.length; i++) {
            if (i > 0) {
              list[i].totalvolume = list[i-1].totalvolume + list[i].volume;
            }
            else {
              list[i].totalvolume = list[i].volume;
            }
            var dp = {};
            dp["value"] = list[i].value;
            dp[type + "volume"] = list[i].volume;
            dp[type + "totalvolume"] = list[i].totalvolume;
            res.push(dp);
          }
        }
      }

      // Init
      var res = [];
      processData(data.bids, "bids", true);
      processData(data.asks, "asks", false);

      //console.log(res);
      return res;
    }
  },
  graphs: [{
    id: "bids",
    fillAlphas: 0.1,
    lineAlpha: 1,
    lineThickness: 2,
    lineColor: "#0f0",
    type: "step",
    valueField: "bidstotalvolume",
    balloonFunction: balloon
  }, {
    id: "asks",
    fillAlphas: 0.1,
    lineAlpha: 1,
    lineThickness: 2,
    lineColor: "#f00",
    type: "step",
    valueField: "askstotalvolume",
    balloonFunction: balloon
  }, {
    lineAlpha: 0,
    fillAlphas: 0.2,
    lineColor: "#000",
    type: "column",
    clustered: false,
    valueField: "bidsvolume",
    showBalloon: false
  }, {
    lineAlpha: 0,
    fillAlphas: 0.2,
    lineColor: "#000",
    type: "column",
    clustered: false,
    valueField: "asksvolume",
    showBalloon: false
  }],
  categoryField: "value",
  chartCursor: {},
  balloon: {
    textAlign: "left"
  },
  valueAxes: [{
    title: "Volume"
  }],
  categoryAxis: {
    title: currencyPairToShow,
    minHorizontalGap: 100,
    startOnAxis: true,
    showFirstLabel: false,
    showLastLabel: false
  },
  export: {
    enabled: true
  }
});

function balloon(item, graph) {
  var txt;
  if (graph.id == "asks") {
    txt = "Ask: <strong>" + formatNumber(item.dataContext.value, graph.chart, 4) + "</strong><br />"
      + "Total volume: <strong>" + formatNumber(item.dataContext.askstotalvolume, graph.chart, 4) + "</strong><br />"
      + "Volume: <strong>" + formatNumber(item.dataContext.asksvolume, graph.chart, 4) + "</strong>";
  }
  else {
    txt = "Bid: <strong>" + formatNumber(item.dataContext.value, graph.chart, 4) + "</strong><br />"
      + "Total volume: <strong>" + formatNumber(item.dataContext.bidstotalvolume, graph.chart, 4) + "</strong><br />"
      + "Volume: <strong>" + formatNumber(item.dataContext.bidsvolume, graph.chart, 4) + "</strong>";
  }
  return txt;
}

function formatNumber(val, chart, precision) {
  return AmCharts.formatNumber(
    val,
    {
      precision: precision ? precision : chart.precision,
      decimalSeparator: chart.decimalSeparator,
      thousandsSeparator: chart.thousandsSeparator
    }
  );
}


$(options)

function options() {
  var handler = handleDropdown(handleResults)
  handler('#time-frame-list', 'time')
  handler('#currency-pair-list', 'currency')
}

function handleResults(results) {
  var candleMainRequest = 'http://localhost:8080/v1/crypto/getCandles?currencyPair=t';
  var booksMainRequest = 'http://localhost:8080/v1/crypto/getBooks?currencyPair=t';
  var resultsArray = JSON.stringify(results);
  var currencyPair = resultsArray.substr(25,6);
  var timeFrame = resultsArray.substr(9,2);
  candleRequest = candleMainRequest + currencyPair + '&timeFrame=' + timeFrame;
  booksRequest = booksMainRequest + currencyPair;
  candleChart.dataSets[0].dataLoader.url = candleRequest;
  candleChart.dataSets[0].title = currencyPair;
  changeCategoryAxiesSettings(timeFrame);
  candleChart.dataLoader.loadData();
  orderBookChart.dataLoader.url = booksRequest;
  orderBookChart.categoryAxis.title = currencyPair;
  orderBookChart.dataLoader.loadData();
}

function changeCategoryAxiesSettings(timeFrame) {
  switch(timeFrame) {
    case "1D":
      candleChart.categoryAxesSettings.minPeriod = "DD";
      break;
    case "1h":
      candleChart.categoryAxesSettings.minPeriod = "hh";
      break;
  }
}

function handleDropdown(handler) {
  var options = {}

  return function(selector, key) {
    options[key] = $(selector).val()
    $(selector).change(function(event) {
      options[key] = this.options[event.target.selectedIndex].value
      handler(options)
    })
  }
}
