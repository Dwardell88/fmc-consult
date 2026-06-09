exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  function row(label, value) {
    return `
      <tr>
        <td style="padding:10px 12px;font-size:13px;color:#777;width:38%;border-bottom:1px solid #eee;vertical-align:top;">${label}</td>
        <td style="padding:10px 12px;font-size:13px;color:#1a1612;border-bottom:1px solid #eee;">${value || 'N/A'}</td>
      </tr>`;
  }

  function sectionHeader(title) {
    return `
      <tr>
        <td colspan="2" style="background:#c9a84c;color:#1a1612;font-weight:bold;padding:10px 12px;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding-top:20px;">${title}</td>
      </tr>`;
  }

  const html = `
    <div style="font-family:Georgia,serif;max-width:680px;margin:0 auto;background:#f9f9f9;padding:32px;border-radius:8px;">
      <div style="background:#1a1612;padding:24px;border-radius:6px;margin-bottom:24px;text-align:center;">
        <div style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px;">Favored Marketing Consultants</div>
        <div style="color:#fff;font-size:20px;font-weight:bold;">New Client Intake Submission</div>
        <div style="color:#888;font-size:12px;margin-top:6px;">${data.businessName || ''} &bull; ${data.contactName || ''}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${sectionHeader('Package Selected')}
        ${row('Package', data.packageChoice)}

        ${sectionHeader('Business Information')}
        ${row('Business Name', data.businessName)}
        ${row('Contact Name', data.contactName)}
        ${row('Email', data.email)}
        ${row('Phone', data.phone)}
        ${row('Website', data.websiteUrl)}
        ${row('Industry / Niche', data.industry)}
        ${row('Years in Business', data.yearsInBusiness)}
        ${row('Number of Employees', data.numEmployees)}

        ${sectionHeader('Goals & Current Marketing')}
        ${row('Primary Goal (12 months)', data.primaryGoal)}
        ${row('What success looks like', data.successLooksLike)}
        ${row('Trying to increase', data.increaseGoals)}
        ${row('Current marketing activity', data.currentMarketing)}
        ${row('Active platforms', data.platforms)}
        ${row('What has worked', data.whatWorked)}
        ${row("What hasn't worked", data.whatDidntWork)}

        ${sectionHeader('Budget & Resources')}
        ${row('Worked with agency before', data.workedWithAgency)}
        ${row('Previous agency experience', data.agencyExperience)}
        ${row('Monthly budget', data.budget)}
        ${row('Internal content help', data.internalHelp)}

        ${sectionHeader('Gold Mine Questions')}
        ${row('What keeps them awake at night', data.keepAwake)}
        ${row('Could handle 2x leads', data.handleMoreLeads)}
        ${row('Revenue goal (12 months)', data.revenueGoal)}
        ${row('Already tried', data.alreadyTried)}
        ${row('Why competitors are winning', data.whyCompetitorsWin)}
        ${row('Year from now success picture', data.yearFromNow)}
        ${row('What made them reach out today', data.whyToday)}
        ${row('What to review before meeting', data.reviewBefore)}
      </table>
      <div style="margin-top:24px;text-align:center;font-size:11px;color:#aaa;">
        Submitted via consult.favoredmarketingconsultants.com
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "FMC Client Intake", email: "davidw@sandboxdlabs.com" },
        to: [{ email: "favoredmarketingconsultants@gmail.com", name: "Desiree Wardell" }],
        replyTo: { email: data.email || "favoredmarketingconsultants@gmail.com", name: data.contactName || "Applicant" },
        subject: `New FMC Intake: ${data.contactName || "Unknown"} - ${data.businessName || "Unknown Business"}`,
        htmlContent: html
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Brevo error:", err);
      return { statusCode: 500, body: "Email failed" };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
