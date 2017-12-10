var request, currencyPairToShow;
firstDeployRequest();
firstDeployCurrencyPair();

function firstDeployRequest() {
  request = 'http://localhost:8080/v1/crypto/getCandles?currencyPair=tBTCUSD&timeFrame=1D';
}

function firstDeployCurrencyPair() {
  currencyPairToShow = request.substr(57,6);
}


var candleChart =	AmCharts.makeChart("chartdiv", {
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
      			url: request,
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

$(options)

function options() {
  var handler = handleDropdown(handleResults)
  handler('#time-frame-list', 'time')
  handler('#currency-pair-list', 'currency')
}

function handleResults(results) {
  var mainRequest = 'http://localhost:8080/v1/crypto/getCandles?currencyPair=t';
  var resultsArray = JSON.stringify(results);
  var currencyPair = resultsArray.substr(25,6);
  var timeFrame = resultsArray.substr(9,2);
  request = mainRequest + currencyPair + '&timeFrame=' + timeFrame;
  candleChart.dataSets[0].dataLoader.url = request;
  candleChart.dataSets[0].title = currencyPair;
  changeCategoryAxiesSettings(timeFrame);
  candleChart.dataLoader.loadData();
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
