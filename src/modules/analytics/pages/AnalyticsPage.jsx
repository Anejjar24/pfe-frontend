import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import {
  fetchAnalyticsOverview,
  fetchAnalyticsSensors,
  fetchSensorStats,
  fetchKpis,
  fetchSystemMetrics,
  fetchPipelineStats,
  clearSensorStats,
  selectAnalyticsOverview,
  selectAnalyticsOverviewLoading,
  selectAnalyticsOverviewError,
  selectAnalyticsSensors,
  selectAnalyticsSensorStats,
  selectAnalyticsStatsLoading,
  selectAnalyticsStatsError,
  selectAnalyticsKpis,
  selectAnalyticsKpisLoading,
  selectAnalyticsSystemMetrics,
  selectAnalyticsPipelineStats,
} from '../../../store/slices/analyticsSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS_CSS = {
  normal: '#2dce89', warning: '#fb6340', critical: '#f5365c', offline: '#adb5bd',
};
const SEVERITY_COLORS_CSS = {
  critical: '#f5365c', warning: '#fb6340', error: '#fd7e14', info: '#11cdef',
};

function isoOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 16);
}

const RANGE_PRESETS = [
  { label: '24 h', days: 1 },
  { label: '7 d',  days: 7 },
  { label: '30 d', days: 30 },
];

function fmtNum(n, decimals = 0) {
  if (n == null) return '—';
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: decimals });
}

// ─── Chart builders ───────────────────────────────────────────────────────────

function buildStatusChart(stationsByStatus) {
  const labels = stationsByStatus.map((s) => s.status);
  const counts = stationsByStatus.map((s) => s.count);
  const colors = labels.map((l) => STATUS_COLORS_CSS[l] || '#8898aa');
  return { labels, datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0 }] };
}

function buildSeverityChart(alertsBySeverity) {
  const labels = alertsBySeverity.map((a) => a.severity);
  const counts = alertsBySeverity.map((a) => a.count);
  const colors = labels.map((l) => SEVERITY_COLORS_CSS[l] || '#8898aa');
  return { labels, datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0 }] };
}

function buildSensorLineChart(timeSeries, sensor) {
  if (!timeSeries || timeSeries.length === 0) return null;
  const labels = timeSeries.map((b) => {
    const d = new Date(b.time);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  });
  return {
    labels,
    datasets: [
      { label: `Avg ${sensor?.name || ''} (${sensor?.unit || ''})`, data: timeSeries.map((b) => b.avg), borderColor: '#5e72e4', backgroundColor: 'rgba(94,114,228,0.08)', fill: true, pointRadius: timeSeries.length > 72 ? 0 : 3, borderWidth: 2 },
      { label: 'Min', data: timeSeries.map((b) => b.min), borderColor: '#2dce89', borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0, fill: false },
      { label: 'Max', data: timeSeries.map((b) => b.max), borderColor: '#f5365c', borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0, fill: false },
    ],
  };
}

function buildAnomalyChart(anomalyByStation, stationNames) {
  const stationIds = Object.keys(anomalyByStation);
  if (stationIds.length === 0) return null;
  const labels = stationIds.map((id) => stationNames[id] || id.slice(0, 8));
  const counts = stationIds.map((id) => anomalyByStation[id]);
  return {
    labels,
    datasets: [{
      label: 'Anomaly buckets',
      data: counts,
      backgroundColor: 'rgba(245,54,92,0.7)',
      borderColor: '#f5365c',
      borderWidth: 1,
    }],
  };
}

function buildThroughputChart(topSensors) {
  if (!topSensors || topSensors.length === 0) return null;
  return {
    labels: topSensors.map((s) => s.sensorId.slice(0, 8)),
    datasets: [{
      label: 'Readings',
      data: topSensors.map((s) => s.totalReadings),
      backgroundColor: 'rgba(94,114,228,0.7)',
      borderColor: '#5e72e4',
      borderWidth: 1,
    }],
  };
}

const doughnutOptions = {
  maintainAspectRatio: false,
  legend: { position: 'bottom', labels: { boxWidth: 12 } },
  cutoutPercentage: 65,
};
const lineOptions = {
  maintainAspectRatio: false,
  legend: { display: true, position: 'top', labels: { boxWidth: 12 } },
  scales: {
    xAxes: [{ ticks: { maxTicksLimit: 10, maxRotation: 30, autoSkip: true } }],
    yAxes: [{ ticks: { beginAtZero: false } }],
  },
  tooltips: { mode: 'index', intersect: false },
};
const barOptions = {
  maintainAspectRatio: false,
  legend: { display: false },
  scales: {
    xAxes: [{ ticks: { maxRotation: 45, autoSkip: true } }],
    yAxes: [{ ticks: { beginAtZero: true, precision: 0 } }],
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PipelineHealthPanel({ stats, loading }) {
  if (loading) return <div className="text-center py-3"><Spinner size="sm" color="primary" /></div>;
  if (!stats)  return <p className="text-muted text-center mb-0">No pipeline data yet.</p>;

  const items = [
    { label: 'Readings consumed', value: fmtNum(stats.readingsConsumed), icon: 'ni-chart-bar-32', color: 'primary' },
    { label: 'Anomalies consumed', value: fmtNum(stats.anomaliesConsumed), icon: 'ni-bell-55', color: stats.anomaliesConsumed > 0 ? 'danger' : 'success' },
    { label: 'Consumer running', value: stats.consumerRunning ? 'Yes' : 'No', icon: 'ni-settings', color: stats.consumerRunning ? 'success' : 'warning' },
    { label: 'Last reading', value: stats.lastReadingAt ? new Date(stats.lastReadingAt).toLocaleTimeString() : '—', icon: 'ni-time-alarm', color: 'info' },
  ];

  return (
    <Row>
      {items.map(({ label, value, icon, color }) => (
        <Col xs="6" md="3" key={label} className="mb-3">
          <div className={`d-flex align-items-center p-3 rounded border-left border-${color}`} style={{ borderLeftWidth: 3 }}>
            <div className={`icon icon-shape bg-${color} text-white rounded-circle shadow mr-3`} style={{ width: 36, height: 36, minWidth: 36, fontSize: '0.9rem' }}>
              <i className={`ni ${icon}`} />
            </div>
            <div>
              <div className="text-xs text-muted text-uppercase mb-0">{label}</div>
              <div className="font-weight-bold">{value}</div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
}

function KpiSummaryPanel({ kpis, loading }) {
  if (loading) return <div className="text-center py-3"><Spinner size="sm" color="primary" /></div>;
  if (!kpis || kpis.totalBuckets === 0) return <p className="text-muted text-center mb-0">No pre-computed KPIs yet. Run the Spark aggregation job to populate this panel.</p>;

  const anomalyRate = kpis.totalBuckets > 0
    ? ((kpis.totalAnomalies / kpis.totalBuckets) * 100).toFixed(1)
    : '0.0';

  return (
    <Row>
      {[
        { label: 'KPI Buckets', value: fmtNum(kpis.totalBuckets), color: 'primary' },
        { label: 'Anomaly Buckets', value: fmtNum(kpis.totalAnomalies), color: kpis.totalAnomalies > 0 ? 'danger' : 'success' },
        { label: 'Anomaly Rate', value: `${anomalyRate}%`, color: 'warning' },
        { label: 'Window', value: `${kpis.windowHours}h ${kpis.granularity}`, color: 'info' },
      ].map(({ label, value, color }) => (
        <Col xs="6" md="3" key={label} className="mb-3">
          <Card className={`bg-gradient-${color} border-0 shadow-sm`}>
            <CardBody className="py-3 px-3">
              <h6 className="text-white text-uppercase text-xs mb-1">{label}</h6>
              <span className="h4 font-weight-bold text-white mb-0">{value}</span>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const dispatch = useDispatch();

  const overview       = useSelector(selectAnalyticsOverview);
  const overviewLoading = useSelector(selectAnalyticsOverviewLoading);
  const overviewError   = useSelector(selectAnalyticsOverviewError);
  const sensors        = useSelector(selectAnalyticsSensors);
  const sensorStats    = useSelector(selectAnalyticsSensorStats);
  const statsLoading   = useSelector(selectAnalyticsStatsLoading);
  const statsError     = useSelector(selectAnalyticsStatsError);
  const kpis           = useSelector(selectAnalyticsKpis);
  const kpisLoading    = useSelector(selectAnalyticsKpisLoading);
  const systemMetrics  = useSelector(selectAnalyticsSystemMetrics);
  const pipelineStats  = useSelector(selectAnalyticsPipelineStats);

  const [selectedSensorId, setSelectedSensorId] = useState('');
  const [rangePreset, setRangePreset]   = useState(1);
  const [customFrom, setCustomFrom]     = useState('');
  const [customTo, setCustomTo]         = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [kpiGranularity, setKpiGranularity] = useState('hourly');

  // Load on mount
  useEffect(() => {
    dispatch(fetchAnalyticsOverview());
    dispatch(fetchAnalyticsSensors());
    dispatch(fetchPipelineStats());
    dispatch(fetchSystemMetrics(24));
  }, [dispatch]);

  // Refresh KPIs when granularity changes
  useEffect(() => {
    dispatch(fetchKpis({ granularity: kpiGranularity, hours: 24 }));
  }, [dispatch, kpiGranularity]);

  // Fetch sensor stats when sensor / range changes
  useEffect(() => {
    if (!selectedSensorId) { dispatch(clearSensorStats()); return; }
    const params = {};
    if (useCustomRange) {
      if (customFrom) params.from = new Date(customFrom).toISOString();
      if (customTo)   params.to   = new Date(customTo).toISOString();
    } else {
      params.from = new Date(Date.now() - rangePreset * 24 * 60 * 60 * 1000).toISOString();
      params.to   = new Date().toISOString();
    }
    dispatch(fetchSensorStats({ sensorId: selectedSensorId, params }));
  }, [dispatch, selectedSensorId, rangePreset, useCustomRange, customFrom, customTo]);

  const refreshAll = () => {
    dispatch(fetchAnalyticsOverview());
    dispatch(fetchPipelineStats());
    dispatch(fetchSystemMetrics(24));
    dispatch(fetchKpis({ granularity: kpiGranularity, hours: 24 }));
  };

  // Chart data
  const statusChartData   = overview?.stationsByStatus?.length   ? buildStatusChart(overview.stationsByStatus)   : null;
  const severityChartData = overview?.alertsBySeverity?.length   ? buildSeverityChart(overview.alertsBySeverity) : null;
  const lineChartData     = sensorStats?.timeSeries?.length      ? buildSensorLineChart(sensorStats.timeSeries, sensorStats.sensor) : null;
  const anomalyChartData  = kpis?.anomalyByStation               ? buildAnomalyChart(kpis.anomalyByStation, {}) : null;
  const throughputChartData = systemMetrics?.topSensors?.length  ? buildThroughputChart(systemMetrics.topSensors) : null;

  return (
    <>
      {/* ── Header KPI cards ─────────────────────────────────────────────── */}
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {overviewLoading ? (
              <div className="text-center py-4"><Spinner color="light" /></div>
            ) : overviewError ? (
              <Alert color="warning">{overviewError}</Alert>
            ) : overview ? (
              <Row>
                {[
                  { label: 'Total Stations',      value: overview.totalStations,      icon: 'ni-building',     bg: 'primary' },
                  { label: 'Active Sensors',       value: overview.activeSensors,       icon: 'ni-chart-bar-32', bg: 'success' },
                  { label: 'Open Alerts',          value: overview.openAlerts,          icon: 'ni-bell-55',      bg: overview.openAlerts > 0 ? 'danger' : 'success' },
                  { label: 'Maintenance Pending',  value: overview.maintenancePending,  icon: 'ni-settings',     bg: 'warning' },
                ].map(({ label, value, icon, bg }) => (
                  <Col lg="3" md="6" key={label}>
                    <Card className="card-stats mb-4 mb-xl-0">
                      <CardBody>
                        <Row>
                          <div className="col">
                            <h5 className="card-title text-uppercase text-muted mb-0">{label}</h5>
                            <span className="h2 font-weight-bold mb-0">{value ?? '—'}</span>
                          </div>
                          <Col className="col-auto">
                            <div className={`icon icon-shape bg-${bg} text-white rounded-circle shadow`}>
                              <i className={`ni ${icon}`} />
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : null}
          </div>
        </Container>
      </div>

      <Container className="mt--7" fluid>

        {/* ── Row 1: Station status + Alert severity ───────────────────────── */}
        <Row className="mb-4">
          <Col xl="6" className="mb-4">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex align-items-center justify-content-between">
                <h3 className="mb-0">Stations by Status</h3>
                <Button color="link" size="sm" className="p-0 text-muted" onClick={refreshAll}>
                  <i className="ni ni-refresh-02" />
                </Button>
              </CardHeader>
              <CardBody>
                {!statusChartData ? (
                  <p className="text-muted text-center mb-0">No station data available.</p>
                ) : (
                  <div style={{ height: 220 }}>
                    <Doughnut data={statusChartData} options={doughnutOptions} />
                  </div>
                )}
                {overview?.stationsByStatus?.length > 0 && (
                  <div className="d-flex flex-wrap justify-content-center mt-3">
                    {overview.stationsByStatus.map(({ status, count }) => (
                      <div key={status} className="mx-2 text-center">
                        <Badge style={{ backgroundColor: STATUS_COLORS_CSS[status] || '#8898aa', fontSize: '0.75rem' }} className="text-capitalize">{status}</Badge>
                        <div className="font-weight-bold">{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          <Col xl="6" className="mb-4">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Active Alerts by Severity</h3>
              </CardHeader>
              <CardBody>
                {!severityChartData ? (
                  <p className="text-muted text-center mb-0">No active alerts.</p>
                ) : (
                  <div style={{ height: 220 }}>
                    <Doughnut data={severityChartData} options={doughnutOptions} />
                  </div>
                )}
                {overview?.alertsBySeverity?.length > 0 && (
                  <div className="d-flex flex-wrap justify-content-center mt-3">
                    {overview.alertsBySeverity.map(({ severity, count }) => (
                      <div key={severity} className="mx-2 text-center">
                        <Badge style={{ backgroundColor: SEVERITY_COLORS_CSS[severity] || '#8898aa', fontSize: '0.75rem' }} className="text-capitalize">{severity}</Badge>
                        <div className="font-weight-bold">{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ── Row 2: Pipeline health ───────────────────────────────────────── */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0 d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="mb-0">Kafka Pipeline Health</h3>
                  <p className="text-sm text-muted mb-0">Consumer group stats — live from NestJS KafkaConsumerService</p>
                </div>
                <Button color="link" size="sm" className="p-0 text-muted" onClick={() => dispatch(fetchPipelineStats())}>
                  <i className="ni ni-refresh-02" />
                </Button>
              </CardHeader>
              <CardBody>
                <PipelineHealthPanel stats={pipelineStats} loading={false} />
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ── Row 3: Spark KPI summary + Anomaly frequency ────────────────── */}
        <Row className="mb-4">
          <Col xl="7" className="mb-4">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="mb-0">Spark KPI Summary</h3>
                  <p className="text-sm text-muted mb-0">Pre-computed by the Spark aggregation job (sensor_aggregates)</p>
                </div>
                <div className="d-flex align-items-center" style={{ gap: 6 }}>
                  {['hourly', 'daily'].map((g) => (
                    <Button key={g} size="sm" color={kpiGranularity === g ? 'primary' : 'secondary'} onClick={() => setKpiGranularity(g)}>
                      {g}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardBody>
                <KpiSummaryPanel kpis={kpis} loading={kpisLoading} />
              </CardBody>
            </Card>
          </Col>

          <Col xl="5" className="mb-4">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Anomaly Frequency by Station</h3>
                <p className="text-sm text-muted mb-0">Buckets flagged by the Spark z-score detector (last 24 h)</p>
              </CardHeader>
              <CardBody>
                {!anomalyChartData ? (
                  <p className="text-muted text-center py-4 mb-0">
                    {kpisLoading ? <Spinner size="sm" /> : 'No anomalies detected in the current window.'}
                  </p>
                ) : (
                  <div style={{ height: 220 }}>
                    <Bar data={anomalyChartData} options={barOptions} />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ── Row 4: System throughput ─────────────────────────────────────── */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0 d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="mb-0">System Throughput — Top Sensors (24 h)</h3>
                  <p className="text-sm text-muted mb-0">
                    Total readings:{' '}
                    <strong>{systemMetrics ? fmtNum(systemMetrics.totalReadings) : '—'}</strong>
                    {systemMetrics?.from && (
                      <> · since {new Date(systemMetrics.from).toLocaleString()}</>
                    )}
                  </p>
                </div>
                <Button color="link" size="sm" className="p-0 text-muted" onClick={() => dispatch(fetchSystemMetrics(24))}>
                  <i className="ni ni-refresh-02" />
                </Button>
              </CardHeader>
              <CardBody>
                {!throughputChartData ? (
                  <p className="text-muted text-center py-4 mb-0">No throughput data yet (requires TimescaleDB continuous aggregates).</p>
                ) : (
                  <div style={{ height: 220 }}>
                    <Bar data={throughputChartData} options={barOptions} />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ── Row 5: Sensor analysis ───────────────────────────────────────── */}
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <Col>
                    <h3 className="mb-0">Sensor Analysis</h3>
                    <p className="text-sm text-muted mb-0">Select a sensor and time range to view aggregated statistics.</p>
                  </Col>
                </Row>

                <Row className="mt-3 align-items-end">
                  <Col md="4">
                    <FormGroup className="mb-0">
                      <Label className="form-control-label text-sm">Sensor</Label>
                      <Input type="select" value={selectedSensorId} onChange={(e) => setSelectedSensorId(e.target.value)}>
                        <option value="">— Select a sensor —</option>
                        {sensors.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.unit}) {s.station?.name ? `· ${s.station.name}` : ''}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>

                  <Col md="5">
                    <FormGroup className="mb-0">
                      <Label className="form-control-label text-sm">Time Range</Label>
                      <div className="d-flex align-items-center flex-wrap" style={{ gap: '6px' }}>
                        {RANGE_PRESETS.map(({ label, days }) => (
                          <Button key={days} size="sm" color={!useCustomRange && rangePreset === days ? 'primary' : 'secondary'} onClick={() => { setRangePreset(days); setUseCustomRange(false); }}>
                            {label}
                          </Button>
                        ))}
                        <Button size="sm" color={useCustomRange ? 'primary' : 'secondary'} onClick={() => setUseCustomRange(true)}>
                          Custom
                        </Button>
                      </div>
                    </FormGroup>
                  </Col>

                  {useCustomRange && (
                    <Col md="3">
                      <FormGroup className="mb-0">
                        <Label className="form-control-label text-sm">From</Label>
                        <Input type="datetime-local" value={customFrom || isoOffset(7)} onChange={(e) => setCustomFrom(e.target.value)} />
                      </FormGroup>
                      <FormGroup className="mb-0 mt-2">
                        <Label className="form-control-label text-sm">To</Label>
                        <Input type="datetime-local" value={customTo || new Date().toISOString().slice(0, 16)} onChange={(e) => setCustomTo(e.target.value)} />
                      </FormGroup>
                    </Col>
                  )}
                </Row>
              </CardHeader>

              <CardBody>
                {!selectedSensorId && (
                  <p className="text-muted text-center py-5">Select a sensor above to view analytics.</p>
                )}
                {selectedSensorId && statsLoading && (
                  <div className="text-center py-5"><Spinner color="primary" /></div>
                )}
                {selectedSensorId && statsError && (
                  <Alert color="danger">{statsError}</Alert>
                )}

                {selectedSensorId && !statsLoading && sensorStats && (
                  <>
                    <Row className="mb-4">
                      {[
                        { label: 'Average',  value: sensorStats.stats.avg,    unit: sensorStats.sensor.unit, color: 'primary' },
                        { label: 'Minimum',  value: sensorStats.stats.min,    unit: sensorStats.sensor.unit, color: 'success' },
                        { label: 'Maximum',  value: sensorStats.stats.max,    unit: sensorStats.sensor.unit, color: 'danger'  },
                        { label: 'Readings', value: sensorStats.stats.count,  unit: '',                      color: 'info'    },
                        { label: 'Std Dev',  value: sensorStats.stats.stddev, unit: sensorStats.sensor.unit, color: 'warning' },
                      ].map(({ label, value, unit, color }) => (
                        <Col key={label} xs="6" md="4" xl="2" className="mb-3">
                          <Card className={`bg-gradient-${color} border-0`}>
                            <CardBody className="py-3 px-3">
                              <h6 className="text-white text-uppercase text-xs mb-1">{label}</h6>
                              <span className="h4 font-weight-bold text-white mb-0">
                                {value != null ? Number(value).toFixed(2) : '—'}
                                {unit && value != null ? <small className="ml-1" style={{ fontSize: '0.65rem' }}>{unit}</small> : null}
                              </span>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>

                    {lineChartData ? (
                      <div style={{ height: 300 }}>
                        <Line data={lineChartData} options={lineOptions} />
                      </div>
                    ) : (
                      <p className="text-muted text-center py-4">No readings found for the selected period.</p>
                    )}

                    <Row className="mt-3">
                      <Col>
                        <small className="text-muted">
                          <strong>{sensorStats.sensor.name}</strong>
                          {' · '}Type: <span className="text-capitalize">{sensorStats.sensor.type}</span>
                          {' · '}Status:{' '}
                          <Badge color={sensorStats.sensor.status === 'active' ? 'success' : 'secondary'} className="text-capitalize">
                            {sensorStats.sensor.status}
                          </Badge>
                          {sensorStats.sensor.station && (
                            <> · Station: <strong>{sensorStats.sensor.station.name}</strong></>
                          )}
                          {sensorStats.sensor.minThreshold != null && (
                            <> · Min threshold: {sensorStats.sensor.minThreshold} {sensorStats.sensor.unit}</>
                          )}
                          {sensorStats.sensor.maxThreshold != null && (
                            <> · Max threshold: {sensorStats.sensor.maxThreshold} {sensorStats.sensor.unit}</>
                          )}
                        </small>
                      </Col>
                    </Row>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

      </Container>
    </>
  );
}
