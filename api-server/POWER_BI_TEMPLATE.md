# 📊 Power BI Integration Template

## 🎯 Pre-Built Power BI Solutions

This template provides ready-to-use Power BI reports for your risk management data.

## 📋 Data Sources Setup

### 1. Primary Data Connection

**Occurrences Data Source:**
```
Data Source: Web
URL: http://localhost:3001/api/occurrences
Authentication: None (using headers)
Headers:
  x-client-id: key_admin
  x-client-secret: secret_admin
```

**Power Query M Code:**
```powerquery
let
    Source = Json.Document(Web.Contents("http://localhost:3001/api/occurrences", [
        Headers=[
            #"x-client-id"="key_admin",
            #"x-client-secret"="secret_admin"
        ]
    ])),
    DataList = Source[data],
    ToTable = Table.FromList(DataList, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandAll = Table.ExpandRecordColumn(ToTable, "Column1", 
        {"id", "title", "type", "status", "priority", "factory", "reportedDate", "location", "description", "reporter", "investigator", "impact", "likelihood", "riskScore", "actionTaken", "completedDate", "tags", "attachments", "notes"})
in
    ExpandAll
```

## 📊 Report Templates

### 🎛️ Executive Dashboard

**KPI Cards:**
- Total Occurrences: `COUNTROWS(Occurrences)`
- Open Issues: `COUNTROWS(FILTER(Occurrences, Occurrences[status] <> "completed"))`
- High Priority: `COUNTROWS(FILTER(Occurrences, Occurrences[priority] = "high"))`
- This Month: `COUNTROWS(FILTER(Occurrences, MONTH(Occurrences[reportedDate]) = MONTH(TODAY())))`

**Visualizations:**
1. **Line Chart**: Occurrences trend by month
2. **Donut Chart**: Status distribution
3. **Bar Chart**: Top factories by occurrence count
4. **Matrix**: Risk score by type and priority

### 🏭 Operational Dashboard

**Factory Performance:**
```dax
Factory Risk Score = 
AVERAGEX(
    FILTER(Occurrences, Occurrences[factory] = SELECTEDVALUE(Factories[code])),
    Occurrences[riskScore]
)
```

**Visualizations:**
1. **Map**: Occurrences by location
2. **Table**: Open high-priority items
3. **Gauge**: Average risk score by factory
4. **Waterfall**: Monthly occurrence changes

### 📋 Compliance Dashboard

**Compliance Metrics:**
```dax
Compliance Rate = 
DIVIDE(
    COUNTROWS(FILTER(Occurrences, Occurrences[status] = "completed")),
    COUNTROWS(Occurrences)
) * 100
```

**Visualizations:**
1. **Thermometer**: Overall compliance rate
2. **Timeline**: Investigation durations
3. **Funnel**: Occurrence resolution stages
4. **Scatter Plot**: Risk vs impact analysis

## 🔄 Data Refresh Strategy

### Manual Refresh
1. **Sync data**: Use Admin → API Sync in your app
2. **Refresh report**: Click refresh in Power BI

### Automatic Refresh (Power BI Service)
1. **Publish to Power BI Service**
2. **Configure Gateway** (if on-premises)
3. **Set refresh schedule**: Hourly, daily, or custom
4. **Monitor refresh status**: View refresh history

## 🎨 Custom Visualizations

### Risk Heatmap
```dax
Risk Color = 
SWITCH(
    TRUE(),
    [riskScore] >= 15, "#DC2626", // Red - Critical
    [riskScore] >= 10, "#EA580C", // Orange - High
    [riskScore] >= 5, "#FACC15",  // Yellow - Medium
    "#16A34A" // Green - Low
)
```

### Trend Analysis
```dax
Month Over Month = 
VAR CurrentMonth = COUNTROWS(Occurrences)
VAR PreviousMonth = 
    CALCULATE(
        COUNTROWS(Occurrences),
        DATEADD(Occurrences[reportedDate], -1, MONTH)
    )
RETURN
    DIVIDE(CurrentMonth - PreviousMonth, PreviousMonth) * 100
```

## 📈 Advanced Analytics

### Predictive Analytics
```dax
Risk Trend = 
AVERAGEX(
    DATESINPERIOD(Occurrences[reportedDate], LASTDATE(Occurrences[reportedDate]), -3, MONTH),
    [Average Risk Score]
)
```

### Performance Indicators
```dax
Investigation Efficiency = 
AVERAGEX(
    FILTER(Occurrences, NOT ISBLANK(Occurrences[completedDate])),
    DATEDIFF(Occurrences[reportedDate], Occurrences[completedDate], DAY)
)
```

## 🛠️ Setup Instructions

### Step 1: Import Template
1. Download Power BI template file (.pbit)
2. Open in Power BI Desktop
3. Enter your API server URL when prompted
4. Provide API credentials

### Step 2: Customize Data Source
1. **File → Options → Data source settings**
2. **Edit credentials**
3. **Update server URL** for production
4. **Test connection**

### Step 3: Personalize Reports
1. **Add your company branding**
2. **Customize colors and themes**
3. **Add/remove visualizations**
4. **Configure filters and slicers**

### Step 4: Publish and Share
1. **Sign in to Power BI Service**
2. **Publish to workspace**
3. **Set up data refresh**
4. **Share with stakeholders**

## 📊 Sample Queries for Custom Reports

### Factory Comparison
```powerquery
let
    Source = Occurrences,
    GroupedData = Table.Group(Source, {"factory"}, {
        {"Total Count", each Table.RowCount(_), type number},
        {"Avg Risk Score", each List.Average([riskScore]), type number},
        {"High Priority", each List.Count(List.Select([priority], each _ = "high")), type number}
    })
in
    GroupedData
```

### Monthly Trends
```powerquery
let
    Source = Occurrences,
    AddedMonth = Table.AddColumn(Source, "Year-Month", each Date.ToText([reportedDate], "yyyy-MM")),
    GroupedByMonth = Table.Group(AddedMonth, {"Year-Month"}, {
        {"Count", each Table.RowCount(_), type number},
        {"Avg Risk", each List.Average([riskScore]), type number}
    })
in
    GroupedByMonth
```

### Risk Distribution
```powerquery
let
    Source = Occurrences,
    AddedRiskCategory = Table.AddColumn(Source, "Risk Category", each 
        if [riskScore] >= 15 then "Critical"
        else if [riskScore] >= 10 then "High"
        else if [riskScore] >= 5 then "Medium"
        else "Low"),
    GroupedByRisk = Table.Group(AddedRiskCategory, {"Risk Category"}, {
        {"Count", each Table.RowCount(_), type number}
    })
in
    GroupedByRisk
```

## 🔧 Troubleshooting

### Common Issues

1. **Data Not Loading**
   - Check API server is running
   - Verify credentials are correct
   - Test API endpoint directly in browser

2. **Authentication Errors**
   - Ensure headers are properly formatted
   - Check API key is active
   - Verify client ID and secret

3. **Performance Issues**
   - Add query filters to limit data
   - Use incremental refresh for large datasets
   - Optimize DAX calculations

### Performance Optimization

1. **Query Folding**
   - Use API query parameters: `?limit=1000&factory=BTL`
   - Filter at source level, not in Power BI

2. **Data Model**
   - Create relationships between tables
   - Use calculated columns sparingly
   - Prefer measures over calculated columns

3. **Refresh Strategy**
   - Schedule during off-peak hours
   - Use incremental refresh for historical data
   - Monitor gateway performance

## 📞 Support Resources

### Documentation
- **Power BI Learning Path**: Microsoft Learn
- **DAX Reference**: Official DAX documentation
- **Power Query M**: Formula language reference

### Community
- **Power BI Community**: Forums and discussions
- **YouTube Tutorials**: Video learning resources
- **GitHub Examples**: Sample reports and code

---

This template provides a complete foundation for Power BI integration with your risk management system. Customize as needed for your specific requirements and branding.
