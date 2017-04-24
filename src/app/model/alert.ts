export class Alert {
  score: number;
  description: string;
  alertId: string;
  age: string;
  source_type: string;
  ip_src_addr: string;
  sourceLocation: string;
  ip_dst_addr: string;
  designatedHost: string;
  status: string;
  _id: string;
  _index: string;
  _type: string;
  _source: {};

  constructor(score: number, description: string, alertId: string, age: string, alertSource: string, sourceIp: string,
              sourceLocation: string, destinationIP: string, designatedHost: string, status: string, index: string, type: string, _source: {}) {
    this.score = score;
    this.description = description;
    this.alertId = alertId;
    this._id = alertId;
    this.age = age;
    this.source_type = alertSource;
    this.ip_src_addr = sourceIp;
    this.sourceLocation = sourceLocation;
    this.ip_dst_addr = destinationIP;
    this.designatedHost = designatedHost;
    this.status = status ? status : 'NEW';
    this._index = index;
    this._type = type;

    this._source = _source;
  }

  public static getData() {
    return [
      new Alert(85, 'Threat Intel - IP from Ireland', '234', '1 hour ago', 'Bro', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'x230-12811', 'New', 'index', 'type', {}),
      new Alert(85, 'Velocity Access - Ireland to USA', '342', '11 hours ago', 'FireEye', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'x230-34221', 'Open', 'index', 'type', {}),
      new Alert(70, 'Anomaly - Gmail Activity', '432', '2 hours ago', 'Metron', '10.23.41.123', 'Limerick, Ireland', '10.23.41.123', 'ww-staff-wp1', 'Open', 'index', 'type', {}),
      new Alert(50, 'Anomaly - Port scan', '123', '4 hours ago', 'Fire Eye', '10.23.41.123', 'Limerick, Ireland', '10.23.41.123', 'x230-23311', 'New', 'index', 'type', {}),
      new Alert(50, 'Beaconing Host: 122.28.59.234', '125', '11 hours ago', 'Bro', '10.23.41.123', 'Limerick, Ireland', '10.23.41.123', 'ww-staff-wp1', 'New', 'index', 'type', {}),
      new Alert(50, 'Failed Login', '126', '2 hours ago', 'Snort', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'x230-32122', 'New', 'index', 'type', {}),
      new Alert(50, 'Angler EK Flash Exploit M2', '153', '4 hours ago', 'Metron', '10.23.41.123', 'Limerick, Ireland', '10.23.41.123', 'x230-45545', 'New', 'index', 'type', {}),
      new Alert(45, 'Anomaly - Port scan', '184', '7 hours ago', 'Fire Eye', '10.23.41.123', 'Limerick, Ireland', '10.23.41.123', 'ww-staff-wp1', 'New', 'index', 'type', {}),
      new Alert(45, 'Targeted Host: 10.1.163.155', '134', '2 days ago', 'Bro', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'x230-34432', 'New', 'index', 'type', {}),
      new Alert(45, 'Beaconing Host: 10.1.163.155', '178', '8 hours ago', 'Snort', '10.23.41.123', 'Limerick, Ireland', '10.23.41.123', 'x230-23311', 'New', 'index', 'type', {}),
      new Alert(45, 'Anomaly - Port scan', '137', '1 day ago', 'Bro', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'ww-staff-wp1', 'New', 'index', 'type', {}),
      new Alert(45, 'Failed Login', '174', '2 days ago ', 'Snort', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'x230-32122', 'New', 'index', 'type', {}),
      new Alert(45, 'Targeted Host: 10.1.163.17', '193', '4 hours ago', 'Metron', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'ww-staff-wp1', 'New', 'index', 'type', {}),
      new Alert(45, 'Beaconing Host: 10.1.163.12', '113', '7 hours ago', 'Fire Eye', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'x230-32122', 'New', 'index', 'type', {}),
      new Alert(40, 'Anomaly - Port scan', '117', '2 days ago ', 'Yaf', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'x230-45545', 'New', 'index', 'type', {}),
      new Alert(40, 'Failed Login', '114', '8 hours ago', 'Fire Eye', '10.23.41.123', 'Limerick, Ireland', '10.23.41.123', 'ww-staff-wp1', 'New', 'index', 'type', {}),
      new Alert(34, 'Anomaly - Port scan', '115', '7 hours ago', 'Metron', '10.23.41.123', 'Los Angeles, CA USA', '10.23.41.123', 'x230-34432', 'New', 'index', 'type', {})
    ];
  }
}
