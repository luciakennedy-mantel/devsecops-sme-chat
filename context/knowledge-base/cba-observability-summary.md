# CBA Observability Framework Summary

## Metadata
- **Source**: CBA OBSERVABILITY WIP.pdf
- **Team**: Payments Observability Squad (COE)
- **Focus**: DevSecOps Maturity through Metrics-Driven Observability
- **Processed**: 2025-01-18

## Mission & Goals

### Team Mission
The Payments Observability Squad exists within COE to support payments teams by:
- Accelerating DevSecOps maturity through metrics-driven observability
- Establishing aligned alerts based on clear SLIs and SLOs
- Ensuring monitoring is targeted, proactive, and supports reliable payment services

### Core Value Proposition
- **Infrastructure Observability**: Tells you if systems are running
- **Application Observability**: Reveals actual health and performance from user perspective
- **Business Impact**: Provides data-driven guidance for team discussions and future work prioritization

## Critical User Journey (CUJ) Framework

### CUJ Creation Process (Lo-Fi Approach)
1. **Define Customers/Users**
   - Other applications
   - Internal teams  
   - End users

2. **Map Journey Flow**
   - Entry points: Where users/systems begin interacting
   - Exit points: What marks completion
   - Boundaries & Dependencies

3. **Define Dependencies**
   - What you depend on others to deliver
   - What others depend on you to deliver
   - What you're delivering to users

4. **Identify Failure Modes**
   - How things could go wrong
   - Example: Inability to validate account funds for payment requests

5. **Define SLIs (Service Level Indicators)**
   - Convert customer matrix into measurable metrics
   - Focus on what reflects CUJ health (latency, error rate, availability)

6. **Define SLOs (Service Level Objectives)**
   - Set performance targets
   - Define acceptable service levels
   - Guide reliability goals and team priorities

## Observability Maturity Levels

### Level 0: No Visibility
- **Data**: No metrics or logs generated/captured
- **Alerting**: No alerts, relying on user complaints
- **Measurement**: No level of measure

### Level 1: Basic Logging
- **Data**: Logs going to Observe
- **Alerting**: Alerts going to FlightDeck (central team)
- **Measurement**: Basic indicators for alert triggers

### Level 2: Structured Monitoring
- **Data**: Baseline metrics to Obstack with dashboards, logs to Observe
- **Alerting**: Alerts to PagerDuty and team members
- **Measurement**: First pass defined CUJ, mix of generalized and defined SLI/SLOs

### Level 3: Advanced Observability
- **Data**: Well-defined metrics to ObStack, detailed dashboards with dependencies
- **Alerting**: Tiered alerts with critical ones to PagerDuty
- **Measurement**: Well-defined SLI/SLOs based on CUJs, constant revision
- **Proactive**: Using dashboards to predict and mitigate issues before customer impact

## Tools & Technologies

### Observe vs Obstack
- **Observe Inc**: Enterprise logging tool for centralized diagnostic log information
- **Obstack**: Group's metrics store and alerting tool for SLI & SLO alerts
- **Access**: All metrics hosted on metrics.cba (Grafana/Prometheus) - open to anyone at CBA

### Configuration Approach
- PagerDuty: Configurable by support groups, no coding required
- SLI/SLO rollout: All configuration-based
- Quick and iterative implementation

## Implementation Strategy

### Flexible Starting Points
Teams can start where it makes most sense:
- CUJ analysis to understand user journeys
- Baseline metrics generation for current performance visibility
- Both are valid entry points for iterative improvement

### Prioritization Guidelines
- Focus on applications serving as critical dependencies
- Prioritize customer-facing deliverables
- Even small services can be critical components

### Support Resources Available
- **CUJ Consultation**: Guidance on identifying and refining Critical User Journeys
- **Instrumentation Support**: Help with integrating observability
- **Defining CUJs, SLIs, and SLOs**: Hands-on support for meaningful metrics
- **General Assistance**: Help with any DevSecOps maturity step
- **Workshops**: Interactive sessions for tools, practices, and strategies

## Key Principles

### Shift from Logs to Metrics
- **Logs**: Diagnostic tool, not ideal for indicating problems
- **Metrics**: Provide real-time insights into application health
- **Approach**: Move from reactive to proactive monitoring

### Metrics-Driven Philosophy
- Move away from infrastructure metrics (memory usage)
- Focus on value delivery metrics
- Consolidate metrics into tangible application performance indicators

## Assessment Framework

### Current State Questions
1. **Observability Data**: What type exists and how easily available?
2. **Failure Detection**: How does squad find out service is broken?
3. **Reliability Measurement**: How is service reliability measured?

### Self-Assessment Tool
- Capability measurement across 4 levels (0-3)
- Iterative process with continuous improvement
- Level 3 demands constant evaluation and alignment with business requirements

## Integration with DevSecOps

### Business Value
- Highlight current application health
- Predict future states and potential issues
- Provide data-driven guidance for decisions
- Shape and prioritize future work
- Build more resilient, user-focused systems

### Iterative Process
- Designed to be flexible and progressive
- Each step can be revisited and refined
- Allows practices to evolve and mature over time
- No need to get everything perfect in first pass

## Next Steps Framework

1. **Self-Assessment**: Use tool to define current observability state
2. **Prioritization**: Choose starting point based on team readiness
3. **Implementation**: Begin with CUJ analysis or metrics generation
4. **Iteration**: Continuously refine and improve
5. **Support**: Reach out to observability team for assistance

This framework provides a comprehensive approach to building observability maturity that aligns with business value delivery and user experience.
