import { is } from '../../../../util/ModelUtil';

/**
 * Returns true if the connection is a sequence flow. Otherwise returns false.
 *
 * @param {Connection} connection
 *
 * @return {Boolean}
 */
export function isSequenceFlow(connection) {
  return is(connection, 'bpmn:SequenceFlow');
}
