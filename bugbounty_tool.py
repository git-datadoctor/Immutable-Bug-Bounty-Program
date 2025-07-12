#!/usr/bin/env python3
"""
Bug Bounty Report Submission Tool
For use with the Immutable Bug Bounty Program
"""

def submit_report(title, description, severity, poc_url=None):
    """Submit a vulnerability report"""
    
    # Validate required fields
    if not title or not description or not severity:
        return "Error: Missing required fields"
    
    # Validate severity level
    valid_severities = ['P1', 'P2', 'P3', 'P4', 'P5']
    if severity not in valid_severities:
        return f"Error: Invalid severity. Must be one of {valid_severities}"
    
    # Format report
    report = {
        'title': title,
        'description': description,
        'severity': severity,
        'poc_url': poc_url,
        'username': get_username(),
        'timestamp': get_timestamp()
    }
    
    # Submit to Bugcrowd API
    try:
        response = requests.post(
            'https://api.bugcrowd.com/vulnerabilities',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(report),
            auth=(get_api_key(), '')
        )
        
        if response.status_code == 201:
            return f"Report submitted successfully! Vulnerability ID: {response.json()['id']}"
        else:
            return f"Error submitting report: {response.status_code} - {response.text}"
            
    except Exception as e:
        return f"Error connecting to Bugcrowd API: {str(e)}"

def get_username():
    """Get researcher's username"""
    return os.environ.get('BUGCROWD_USERNAME', '')

def get_api_key():
    """Get researcher's API key"""
    return os.environ.get('BUGCROWD_API_KEY', '')

def get_timestamp():
    """Get current timestamp"""
    return datetime.datetime.now().isoformat()

def validate_report(title, description, severity, poc_url=None):
    """Validate report before submission"""
    
    # Check length constraints
    if len(title) > 100:
        return "Error: Title exceeds maximum length of 100 characters"
    
    if len(description) > 5000:
        return "Error: Description exceeds maximum length of 5000 characters"
    
    # Check for required fields
    if not title:
        return "Error: Title cannot be empty"
    
    if not description:
        return "Error: Description cannot be empty"
    
    # Validate URL if provided
    if poc_url and not is_valid_url(poc_url):
        return "Error: Provided URL is invalid"
    
    return None

def is_valid_url(url):
    """Validate URL format"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def main():
    # Get report details
    title = input("Enter vulnerability title: ")
    description = input("Enter vulnerability description: ")
    severity = input("Enter severity (P1-P5): ")
    poc_url = input("Enter proof-of-concept URL (optional): ")
    
    # Validate before submission
    validation_error = validate_report(title, description, severity, poc_url)
    if validation_error:
        print(validation_error)
        return
    
    # Submit report
    result = submit_report(title, description, severity, poc_url)
    print(result)

if __name__ == "__main__":
    main()
