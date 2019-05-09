import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  assign,
  pick
} from 'min-dash';

import { is } from '../../../util/ModelUtil';
import { isSequenceFlow } from './util/ConnectionUtil';

var LOW_PRIORITY = 250;

export default function SubProcessBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Adjust position of SubProcess after it replaces a shape with incoming
   * sequence flows and no outgoing sequence flows to prevent overlap.
   */
  this.postExecuted('shape.replace', function(event) {
    var oldShape = event.context.oldShape,
        newShape = event.context.newShape;

    if (
      !is(newShape, 'bpmn:SubProcess')
    ) {
      return;
    }

    if (
      !hasIncomingSequenceFlows(newShape) ||
      hasOutgoingSequenceFlows(newShape)
    ) {
      return;
    }

    modeling.moveShape(newShape, {
      x: oldShape.x - newShape.x,
      y: 0
    });
  });

  // Pass partial pre-toggled state of SubProcess to context
  this.preExecuted('shape.toggleCollapse', function(event) {
    var shape = event.context.shape;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    event.context.preToggledShapeProps = assign(
      {},
      pick(shape, [
        'x',
        'incoming',
        'outgoing'
      ])
    );
  });

  /**
   * Adjust position of SubProcess with incoming sequence flows and no outgoing
   * sequence flows after toggling to prevent overlap.
   */
  this.postExecuted('shape.toggleCollapse', LOW_PRIORITY, function(event) {
    var preToggledShapeProps = event.context.preToggledShapeProps,
        postToggledShape = event.context.shape;

    if (
      !is(postToggledShape, 'bpmn:SubProcess')
    ) {
      return;
    }

    if (
      !hasIncomingSequenceFlows(preToggledShapeProps) ||
      hasOutgoingSequenceFlows(preToggledShapeProps)
    ) {
      return;
    }

    modeling.moveShape(postToggledShape, {
      x: preToggledShapeProps.x - postToggledShape.x,
      y: 0
    });
  });
}

SubProcessBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(SubProcessBehavior, CommandInterceptor);

// Helpers ////////////////////

function hasIncomingSequenceFlows(shape) {
  shape = shape || {};

  if (
    shape.incoming &&
    shape.incoming.length
  ) {
    return shape.incoming.some(isSequenceFlow);
  }

  return false;
}

function hasOutgoingSequenceFlows(shape) {
  shape = shape || {};

  if (
    shape.outgoing &&
    shape.outgoing.length
  ) {
    return shape.outgoing.some(isSequenceFlow);
  }

  return false;
}
