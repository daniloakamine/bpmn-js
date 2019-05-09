/* global sinon */

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';

describe('features/modeling/behavior - subprocess', function() {
  var diagramXML = require('./SubProcessBehavior.bpmn');

  beforeEach(bootstrapModeler(
    diagramXML, {
      modules: [
        coreModule,
        modelingModule,
        replaceModule
      ]
    }
  ));

  afterEach(sinon.restore);


  describe('when replacing shape -> expanded subprocess', function() {

    describe('and shape has incoming sequence flows', function() {

      it('should adjust expandedSubProcess x-position to shape x-position',
        inject(function(elementRegistry, bpmnReplace) {

          // given
          var shape = elementRegistry.get('Task_A'),
              expandedSubProcess;

          // when
          expandedSubProcess = bpmnReplace.replaceElement(shape, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          var expectedBounds = {
            x: shape.x,
            y: 21,
            width: 350,
            height: 200
          };

          expect(expandedSubProcess).to.have.bounds(expectedBounds);
        })

      );

    });


    describe('and shape has no incoming sequence flows', function() {

      it('should NOT adjust expanded subprocess', inject(
        function(elementRegistry, bpmnReplace, modeling) {

          // given
          var shape = elementRegistry.get('Task_AA');

          sinon.spy(modeling, 'moveShape');

          // when
          bpmnReplace.replaceElement(shape, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          expect(modeling.moveShape).to.not.have.been.called;
        })
      );

    });


    describe('and shape has outgoing sequence flows', function() {

      it('should NOT adjust expanded subprocess',
        inject(function(elementRegistry, bpmnReplace, modeling) {

          // given
          var shape = elementRegistry.get('Task_B');

          sinon.spy(modeling, 'moveShape');

          // when
          bpmnReplace.replaceElement(shape, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          expect(modeling.moveShape).to.not.have.been.called;
        })

      );

    });

  });


  describe('when replacing shape -> non-subprocess', function() {

    it('should NOT adjust new shape', inject(
      function(elementRegistry, bpmnReplace, modeling) {

        // given
        var shape = elementRegistry.get('Task_A');

        sinon.spy(modeling, 'moveShape');

        // when
        bpmnReplace.replaceElement(shape, {
          type: 'bpmn:CallActivity'
        });

        // then
        expect(modeling.moveShape).to.not.have.been.called;
      })
    );

  });


  describe('when toggling collapsed subprocess -> expanded subprocess', function() {

    describe('and collapsed subprocess has incoming sequence flows', function() {

      it('should adjust expandedSubProcess x-position to collapsedSubProcess x-position',
        inject(function(elementRegistry, modeling) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_A'),
              collapsedXPosition = collapsedSubProcess.x,
              expandedSubProcess;

          // when
          modeling.toggleCollapse(collapsedSubProcess);

          expandedSubProcess = elementRegistry.get('SubProcess_A');

          // then
          var expectedBounds = {
            x: collapsedXPosition,
            y: 210,
            width: 350,
            height: 200
          };

          expect(expandedSubProcess).to.have.bounds(expectedBounds);
        })
      );

    });


    describe('and collapsed subprocess has no incoming sequence flows', function() {

      it('should NOT adjust expanded subprocess',
        inject(function(elementRegistry, modeling) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_AA');

          sinon.spy(modeling, 'moveShape');

          // when
          modeling.toggleCollapse(collapsedSubProcess);

          // then
          expect(modeling.moveShape).to.not.have.been.called;
        })
      );

    });


    describe('and collapsed subprocess has outgoing sequence flows', function() {

      it('should NOT adjust expanded subprocess',
        inject(function(elementRegistry, modeling) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_B');

          sinon.spy(modeling, 'moveShape');

          // when
          modeling.toggleCollapse(collapsedSubProcess);

          // then
          expect(modeling.moveShape).to.not.have.been.called;
        })
      );

    });

  });

});
