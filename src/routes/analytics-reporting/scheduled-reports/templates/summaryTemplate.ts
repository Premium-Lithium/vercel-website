export const summaryTemplate = `
<mjml>
  <mj-style>
    th,
    td,
    tr,
    table {
      margin: 10px;
      padding: 10px;
    }
  </mj-style>
  <mj-body background-color="#f0f0f0">
    <mj-section>
      <!-- preamble-->
      <mj-column>
        <mj-text>
          Hi {{ name }},<br>
          Here is the report for {{ energiserModeString }} on {{ date }} over the period {{ period }}.<br><br>
          If the data looks wrong, the report is unclear or you have any suggestions, please let me know.<br><br>
          Andrew
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <!-- Headline data -->
      <mj-column>
        <mj-text align="center">
          <h2>
            Key data
            </h1>
            <table style="padding: auto; margin: auto">
              <tr>
                <td>1000
                <td>3
                <td>5
                <td>2
                <td>6
              </tr>
              <tr>
                <th>Revenue
                <th>Consultations
                <th>Surveys
                <th>Pre-orders
                <th>Express orders
              </tr>
            </table>
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <!-- table data -->
      <mj-column>
        <mj-text>
          <table>
            <tr>
              <td>
                
              </td>
            </tr>
          </table>
        </mj-text>
      </mj-column>
      <mj-column>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`