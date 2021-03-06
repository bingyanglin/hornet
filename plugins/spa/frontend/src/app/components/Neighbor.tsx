import * as React from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NodeStore from "app/stores/NodeStore";
import {inject, observer} from "mobx-react";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import * as prettysize from 'prettysize';
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";
import {defaultChartOptions} from "app/misc/Chart";
import {Line} from "react-chartjs-2";

interface Props {
    nodeStore?: NodeStore;
    identity: string;
}

const lineChartOptions = Object.assign({
    scales: {
        xAxes: [{
            ticks: {
                autoSkip: true,
                maxTicksLimit: 8,
                fontSize: 8,
                minRotation: 0,
                maxRotation: 0,
            },
            showXLabels: 10,
            gridLines: {
                display: false
            }
        }],
        yAxes: [{
            gridLines: {
                display: false
            },
            ticks: {
                callback: function (value, index, values) {
                    return prettysize(Math.abs(value));
                },
                maxTicksLimit: 3,
                fontSize: 10,
            },
        }],
    },
    tooltips: {
        callbacks: {
            label: function (tooltipItem, data) {
                let label = data.datasets[tooltipItem.datasetIndex].label;
                return `${label} ${prettysize(Math.abs(tooltipItem.value))}`;
            }
        }
    }
}, defaultChartOptions);

@inject("nodeStore")
@observer
export class Neighbor extends React.Component<Props, any> {
    render() {
        let neighborMetrics = this.props.nodeStore.neighbor_metrics.get(this.props.identity);
        let last = neighborMetrics.current;
        if (!last.connected) {
            return <Row className={"mb-3"}>
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <h5>{last.origin_addr} (Not Connected)</h5>
                            </Card.Title>
                            <Row className={"mb-3"}>
                                <Col>
                                    <ListGroup variant={"flush"} as={"small"}>
                                        <ListGroup.Item>
                                            Identity: {last.identity}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        }
        return (
            <Row className={"mb-3"}>
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <h5>{last.origin_addr}</h5>
                            </Card.Title>
                            <Row className={"mb-3"}>
                                <Col>
                                    <ListGroup variant={"flush"} as={"small"}>
                                        <ListGroup.Item>
                                            Connected via Protocol Version: {last.protocol_version} {' '}
                                            (Origin: {last.connection_origin === 0 ? "Inbound" : "Outbound"})
                                        </ListGroup.Item>
                                        {
                                            last.heartbeat &&
                                            <ListGroup.Item>
                                                Latest Solid Milestone Index: {' '}
                                                {last.heartbeat.solid_milestone_index}
                                            </ListGroup.Item>
                                        }
                                    </ListGroup>
                                </Col>
                                <Col>
                                    <ListGroup variant={"flush"} as={"small"}>
                                        <ListGroup.Item>
                                            Identity: {last.identity}
                                        </ListGroup.Item>
                                        {
                                            last.heartbeat &&
                                            <ListGroup.Item>
                                                Pruned Milestone Index: {' '}
                                                {last.heartbeat.pruned_milestone_index}
                                            </ListGroup.Item>
                                        }
                                    </ListGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h6>Metrics</h6>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Table responsive>
                                        <thead>
                                        <tr>
                                            <td><small>All</small></td>
                                            {
                                                /*
                                                    Implementable after the TangleProcessor
                                                    knows from who actually a tx was received from
                                                    <td>
                                                        New
                                                    </td>
                                                 */
                                            }
                                            <td><small>Invalid</small></td>
                                            <td><small>Stale</small></td>
                                            <td><small>Sent</small></td>
                                            <td><small>Dropped Packets</small></td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{last.info.numberOfAllTransactions}</td>
                                            {
                                                /*
                                                    See above
                                                    <td>{last.info.numberOfNewTransactions}</td>
                                                 */
                                            }
                                            <td><small>{last.info.numberOfInvalidTransactions}</small></td>
                                            <td><small>{last.info.numberOfStaleTransactions}</small></td>
                                            <td><small>{last.info.numberOfSentTransactions}</small></td>
                                            <td><small>{last.info.numberOfDroppedSentPackets}</small></td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                            <Row className={"mb-3"}>
                                <Col>
                                    <h6>Network (Tx/Rx)</h6>
                                    <Badge pill variant="light">
                                        {'Total: '}
                                        {prettysize(last.bytes_written)}
                                        {' / '}
                                        {prettysize(last.bytes_read)}
                                    </Badge>
                                    {' '}
                                    <Badge pill variant="light">
                                        {'Current: '}
                                        {prettysize(neighborMetrics.currentNetIO && neighborMetrics.currentNetIO.tx)}
                                        {' / '}
                                        {prettysize(neighborMetrics.currentNetIO && neighborMetrics.currentNetIO.rx)}
                                    </Badge>
                                    <Line height={30} data={neighborMetrics.netIOSeries} options={lineChartOptions}/>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    }
}
